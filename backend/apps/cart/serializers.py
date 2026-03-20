from rest_framework import serializers

from .models import Carrito, ItemCarrito


class ItemCarritoSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de ItemCarrito

    class Meta:
        model = ItemCarrito
        fields = "__all__"


class CarritoSerializer(serializers.ModelSerializer):
    # TODO: incluir items del carrito si es necesario

    class Meta:
        model = Carrito
        fields = "__all__"

