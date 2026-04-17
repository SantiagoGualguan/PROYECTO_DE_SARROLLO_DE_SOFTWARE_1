from rest_framework import serializers

from .models import ShoppingCart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de CartItem

    class Meta:
        model = CartItem
        fields = "__all__"


class ShoppingCartSerializer(serializers.ModelSerializer):
    # TODO: incluir items del carrito si es necesario

    class Meta:
        model = ShoppingCart
        fields = "__all__"

