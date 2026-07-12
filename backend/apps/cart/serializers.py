"""
Serializers de la app cart.

Ahora que confirmamos que los modelos tienen ForeignKey reales
(ShoppingCart.user -> CustomUser, CartItem.cart -> ShoppingCart,
CartItem.coreography -> Coreography), usamos ModelSerializer normales
con anidamiento. Ya NO se necesita construir serializers a partir de
dicts de raw SQL para las lecturas.
"""
from rest_framework import serializers

from apps.choreographies.models import Coreography
from .models import CartItem, ShoppingCart


class CoreographyMiniSerializer(serializers.ModelSerializer):
    """
    Datos mínimos de la coreografía para mostrar dentro de un cart_item.
    Campos confirmados contra apps/choreographies/models.py.
    """
    class Meta:
        model = Coreography
        fields = ["coreography_id", "c_name", "price", "image_url"]


class CartItemSerializer(serializers.ModelSerializer):
    coreography = CoreographyMiniSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["cart_item_id", "coreography", "unit_price", "creation_date"]


class ShoppingCartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = ShoppingCart
        fields = ["cart_id", "user", "s_status", "creation_date", "items", "total"]

    def get_total(self, obj):
        # obj.items ya viene prefetch_related desde la view, así que esto
        # no dispara queries extra.
        return sum((item.unit_price for item in obj.items.all()), start=0)


class AddToCartInputSerializer(serializers.Serializer):
    """
    Valida el body del POST /api/cart/items/. El precio NO se recibe del
    cliente (para que no pueda manipularlo): se calcula server-side a
    partir de la coreografía real antes de llamar a add_to_cart().
    """
    coreography_id = serializers.IntegerField(min_value=1)