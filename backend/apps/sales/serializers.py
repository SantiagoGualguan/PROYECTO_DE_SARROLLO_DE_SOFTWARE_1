from rest_framework import serializers

from .models import Venta, ItemVenta, DatosFacturacion


class ItemVentaSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de ItemVenta

    class Meta:
        model = ItemVenta
        fields = "__all__"


class DatosFacturacionSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de DatosFacturacion

    class Meta:
        model = DatosFacturacion
        fields = "__all__"


class VentaSerializer(serializers.ModelSerializer):
    # TODO: incluir items y datos de facturación si es necesario

    class Meta:
        model = Venta
        fields = "__all__"

