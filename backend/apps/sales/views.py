from decimal import Decimal

from django.db import connection, transaction, DatabaseError
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.cart.models import ShoppingCart
from apps.cart.permissions import IsClientRole
from apps.sales.models import Bill, Purchase, UserCoreography

from .serializers import CreatePurchaseSerializer, PurchaseHistorySerializer


class PurchaseViewSet(ViewSet):
    permission_classes = [IsAuthenticated, IsClientRole]

    def list(self, request):
        user = request.user
        purchases = Purchase.objects.filter(
            cart__user=user, cart__s_status="completed"
        ).select_related("cart").prefetch_related(
            "bills", "user_coreographies__coreography"
        ).order_by("-purchase_date", "-purchase_id")

        serializer = PurchaseHistorySerializer(purchases, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreatePurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        cart = ShoppingCart.objects.filter(
            user=user, s_status="active"
        ).first()
        if not cart:
            return Response(
                {"detail": "No tienes un carrito activo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item_count = cart.items.count()
        if cart_item_count == 0:
            return Response(
                {"detail": "El carrito está vacío."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT create_purchase(%s, %s, %s, %s, %s, %s, %s)",
                    [
                        user.id,
                        cart.cart_id,
                        serializer.validated_data["payment_method"],
                        serializer.validated_data["email_address"],
                        serializer.validated_data["titular_name"],
                        serializer.validated_data["document_number"],
                        serializer.validated_data.get("details", ""),
                    ],
                )
        except DatabaseError as exc:
            return Response(
                {"detail": f"Error al procesar la compra: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Compra realizada exitosamente."},
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        user = request.user
        purchase = Purchase.objects.filter(
            purchase_id=pk, cart__user=user
        ).select_related("cart").prefetch_related(
            "bills", "user_coreographies__coreography"
        ).first()
        if not purchase:
            return Response(
                {"detail": "Compra no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PurchaseHistorySerializer(purchase)
        return Response(serializer.data)
