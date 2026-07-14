from unittest.mock import MagicMock
from django.test import SimpleTestCase

from apps.cart.serializers import (
    CoreographyMiniSerializer,
    CartItemSerializer,
    ShoppingCartSerializer,
    AddToCartInputSerializer,
)


class CoreographyMiniSerializerTest(SimpleTestCase):
    def test_fields(self):
        fields = CoreographyMiniSerializer().get_fields()
        self.assertIn("coreography_id", fields)
        self.assertIn("c_name", fields)
        self.assertIn("price", fields)
        self.assertIn("image_url", fields)
        self.assertEqual(len(fields), 4)


class CartItemSerializerTest(SimpleTestCase):
    def test_fields(self):
        fields = CartItemSerializer().get_fields()
        self.assertIn("cart_item_id", fields)
        self.assertIn("coreography", fields)
        self.assertIn("unit_price", fields)
        self.assertIn("creation_date", fields)

    def test_coreography_is_nested(self):
        fields = CartItemSerializer().get_fields()
        self.assertIsInstance(fields["coreography"], CoreographyMiniSerializer)


class ShoppingCartSerializerTest(SimpleTestCase):
    def test_fields(self):
        fields = ShoppingCartSerializer().get_fields()
        self.assertIn("cart_id", fields)
        self.assertIn("user", fields)
        self.assertIn("s_status", fields)
        self.assertIn("creation_date", fields)
        self.assertIn("items", fields)
        self.assertIn("total", fields)

    def test_items_are_nested_cart_items(self):
        fields = ShoppingCartSerializer().get_fields()
        from rest_framework.serializers import ListSerializer
        self.assertIsInstance(fields["items"], ListSerializer)

    def test_total_is_serializer_method_field(self):
        fields = ShoppingCartSerializer().get_fields()
        self.assertIn("total", fields)

    def test_get_total_sums_unit_prices(self):
        item1 = MagicMock()
        item1.unit_price = 10000.00
        item2 = MagicMock()
        item2.unit_price = 25000.00

        items_qs = MagicMock()
        items_qs.all.return_value = [item1, item2]

        cart = MagicMock()
        cart.items = items_qs

        serializer = ShoppingCartSerializer()
        total = serializer.get_total(cart)
        self.assertEqual(total, 35000.0)

    def test_get_total_empty_cart(self):
        items_qs = MagicMock()
        items_qs.all.return_value = []

        cart = MagicMock()
        cart.items = items_qs

        serializer = ShoppingCartSerializer()
        total = serializer.get_total(cart)
        self.assertEqual(total, 0)


class AddToCartInputSerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = AddToCartInputSerializer(data={"coreography_id": 1})
        self.assertTrue(s.is_valid())

    def test_missing_coreography_id(self):
        s = AddToCartInputSerializer(data={})
        self.assertFalse(s.is_valid())
        self.assertIn("coreography_id", s.errors)

    def test_zero_coreography_id(self):
        s = AddToCartInputSerializer(data={"coreography_id": 0})
        self.assertFalse(s.is_valid())

    def test_negative_coreography_id(self):
        s = AddToCartInputSerializer(data={"coreography_id": -1})
        self.assertFalse(s.is_valid())

    def test_string_coreography_id(self):
        s = AddToCartInputSerializer(data={"coreography_id": "abc"})
        self.assertFalse(s.is_valid())

    def test_ignores_extra_fields(self):
        s = AddToCartInputSerializer(data={"coreography_id": 1, "price": "999"})
        self.assertTrue(s.is_valid())
        self.assertNotIn("price", s.validated_data)
