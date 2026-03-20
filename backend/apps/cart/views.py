from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Carrito, ItemCarrito
from .serializers import CarritoSerializer, ItemCarritoSerializer


class CarritoViewSet(viewsets.ViewSet):
    """
    CART:
    - GET /api/cart/  # carrito activo
    """

    def list(self, request):
        raise NotImplementedError("TODO: obtener carrito activo del cliente")


class ItemCarritoViewSet(viewsets.ViewSet):
    """
    CART ITEMS:
    - POST /api/cart/items/        # agregar item
    - DELETE /api/cart/items/<id>/ # quitar item
    - DELETE /api/cart/            # vaciar carrito
    """

    def create(self, request):
        raise NotImplementedError("TODO: agregar item al carrito")

    def destroy(self, request, pk=None):
        raise NotImplementedError("TODO: eliminar item del carrito o vaciar carrito")

