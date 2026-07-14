"""
Views de la app cart.

Lecturas (GET, DELETE de carrito/items puntuales) -> ORM normal, porque
los modelos ya tienen ForeignKey reales aunque managed=False.

Escritura de "agregar al carrito" -> stored procedure add_to_cart(),
porque ahí vive la lógica transaccional (crear carrito si no existe +
insertar item) según el enunciado original.

*** IMPORTANTE ***
add_to_cart() en 02_functions.sql atrapa TODOS sus errores internos con
`EXCEPTION WHEN OTHERS THEN RAISE NOTICE ...` y no los relanza. Esto
significa que psycopg2/Django NUNCA verá una excepción aunque el INSERT
haya fallado (p. ej. violación de FK). Mientras no se corrija esa función
en el SQL (recomendado), esta vista hace una verificación defensiva:
cuenta los items del carrito antes y después de la llamada para inferir
si realmente se insertó algo.
"""
from django.db import connection, transaction, DatabaseError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.choreographies.models import Coreography
from apps.sales.models import UserCoreography

from .models import CartItem, ShoppingCart
from .permissions import IsClientRole
from .serializers import AddToCartInputSerializer, ShoppingCartSerializer


def _get_active_cart(user_id, for_write=False):
    """
    Trae el carrito activo del usuario con sus items + coreografía
    precargados (evita N+1 queries al serializar).
    """
    qs = ShoppingCart.objects.filter(user_id=user_id, s_status="active")
    if not for_write:
        qs = qs.prefetch_related("items__coreography")
    return qs.first()


class ShoppingCartView(APIView):
    """
    GET    /api/cart/  -> carrito activo del usuario autenticado, con items.
    DELETE /api/cart/  -> vacía el carrito activo (elimina todos sus items).
    """
    permission_classes = [IsAuthenticated, IsClientRole]

    def get(self, request):
        cart = _get_active_cart(request.user.id)
        if cart is None:
            return Response(
                {"detail": "No tienes un carrito activo."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ShoppingCartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart = _get_active_cart(request.user.id, for_write=True)
        if cart is None:
            return Response(
                {"detail": "No tienes un carrito activo."},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            CartItem.objects.filter(cart=cart).delete()
            # AJUSTAR: si "vaciar" también debe cambiar s_status
            # (p. ej. a 'cancelled'), descomenta:
            # cart.s_status = "cancelled"
            # cart.save(update_fields=["s_status"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemListCreateView(APIView):
    """
    POST /api/cart/items/ -> agrega una coreografía al carrito activo
    (o lo crea si no existe) llamando al stored procedure add_to_cart().
    """
    permission_classes = [IsAuthenticated, IsClientRole]

    def post(self, request):
        input_serializer = AddToCartInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        coreography_id = input_serializer.validated_data["coreography_id"]

        # 404 explícito si la coreografía no existe, ANTES de llamar al
        # procedure (así no dependemos de que la función reporte el error,
        # que sabemos que no hace).
        coreography = get_object_or_404(Coreography, pk=coreography_id)

        # Integrity rule: cannot add a choreography the client already owns.
        # Confirm_payment also enforces this before Stripe; this is the early UX gate.
        if UserCoreography.objects.filter(
            user_id=request.user.id,
            coreography_id=coreography.pk,
        ).exists():
            return Response(
                {
                    "detail": (
                        f"Ya has comprado la coreografía '{coreography.c_name}'. "
                        "No puedes agregarla al carrito de nuevo."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        unit_price = coreography.price

        cart_before = _get_active_cart(request.user.id, for_write=True)
        items_before = (
            CartItem.objects.filter(cart=cart_before).count() if cart_before else 0
        )

        try:
            with connection.cursor() as cursor:
                # add_to_cart es FUNCTION (RETURNS VOID) -> se llama con SELECT,
                # NO con CALL (CALL es solo para PROCEDURE).
                cursor.execute(
                    "SELECT add_to_cart(%s, %s, %s)",
                    [request.user.id, coreography.pk, unit_price],
                )
        except DatabaseError as exc:
            # Solo se activará si en algún momento corrigen la función SQL
            # para que relance la excepción en vez de tragarla.
            return Response(
                {"detail": f"No se pudo agregar la coreografía: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --- Verificación defensiva (mientras add_to_cart siga tragando errores) ---
        cart_after = _get_active_cart(request.user.id)
        items_after = (
            CartItem.objects.filter(cart=cart_after).count() if cart_after else 0
        )

        if cart_after is None or items_after <= items_before:
            return Response(
                {
                    "detail": (
                        "No se pudo agregar la coreografía al carrito. "
                        "El stored procedure no reportó el error explícitamente; "
                        "revisa los logs de PostgreSQL (RAISE NOTICE)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ShoppingCartSerializer(cart_after)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    """
    DELETE /api/cart/items/<pk>/ -> elimina un item puntual del carrito,
    solo si pertenece al usuario autenticado.
    """
    permission_classes = [IsAuthenticated, IsClientRole]

    def delete(self, request, pk):
        item = get_object_or_404(
            CartItem, pk=pk, cart__user_id=request.user.id, cart__s_status="active"
        )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)