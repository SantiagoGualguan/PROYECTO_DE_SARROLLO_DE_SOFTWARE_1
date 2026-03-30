from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Purchase
from .serializers import PurchaseSerializer


class PurchaseViewSet(viewsets.ModelViewSet):
    """
    SALES:
    - POST /api/sales/                  # crear venta (paso final)
    - GET /api/sales/                   # historial del cliente
    - GET /api/sales/<id>/              # detalle de venta
    - POST /api/sales/confirm-items/    # paso 1 wizard
    - POST /api/sales/confirm-billing/  # paso 2 wizard
    - POST /api/sales/confirm-payment/  # paso 3 wizard
    """

    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer

    def list(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar historial de ventas del cliente")

    def create(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar creación de venta")

    def retrieve(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar detalle de venta")

    @action(detail=False, methods=["post"], url_path="confirm-items")
    def confirm_items(self, request):
        raise NotImplementedError("TODO: implementar confirmación de ítems (paso 1)")

    @action(detail=False, methods=["post"], url_path="confirm-billing")
    def confirm_billing(self, request):
        raise NotImplementedError(
            "TODO: implementar confirmación de datos de facturación (paso 2)"
        )

    @action(detail=False, methods=["post"], url_path="confirm-payment")
    def confirm_payment(self, request):
        raise NotImplementedError(
            "TODO: implementar confirmación de pago simulado (paso 3)"
        )

