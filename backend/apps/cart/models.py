from django.db import models

from apps.users.models import CustomUser
from apps.choreographies.models import Coreografia


class Carrito(models.Model):
    cliente = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)  # False cuando se convierte en venta

    # TODO: agregar métodos para totalizar y gestionar el carrito


class ItemCarrito(models.Model):
    carrito = models.ForeignKey(
        Carrito, related_name="items", on_delete=models.CASCADE
    )
    coreografia = models.ForeignKey(Coreografia, on_delete=models.PROTECT)
    precio_unitario = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # precio al agregar

    class Meta:
        unique_together = [["carrito", "coreografia"]]

    # TODO: agregar métodos auxiliares si se requieren

