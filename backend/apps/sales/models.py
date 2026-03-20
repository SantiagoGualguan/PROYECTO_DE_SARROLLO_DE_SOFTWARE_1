from django.db import models

from apps.users.models import CustomUser
from apps.choreographies.models import Coreografia


class Venta(models.Model):
    ESTADO_CHOICES = [
        ("pendiente", "Pendiente"),
        ("completada", "Completada"),
        ("cancelada", "Cancelada"),
    ]

    cliente = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    fecha_venta = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    numero_orden = models.CharField(
        max_length=50, unique=True
    )  # ej: ORD-2026-0001

    # TODO: agregar lógica de generación de número de orden


class ItemVenta(models.Model):
    venta = models.ForeignKey(
        Venta, related_name="items", on_delete=models.PROTECT
    )
    coreografia = models.ForeignKey(Coreografia, on_delete=models.PROTECT)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    # TODO: agregar métodos auxiliares si se requieren


class DatosFacturacion(models.Model):
    METODO_CHOICES = [
        ("pse", "PSE"),
        ("tarjeta", "Tarjeta de crédito/débito"),
    ]

    venta = models.OneToOneField(Venta, on_delete=models.CASCADE)
    nombre_factura = models.CharField(max_length=200)
    email_factura = models.EmailField()
    documento = models.CharField(max_length=20)  # cédula / NIT
    metodo_pago = models.CharField(max_length=20, choices=METODO_CHOICES)

    # El pago es SIMULADO — no integrar pasarela real

