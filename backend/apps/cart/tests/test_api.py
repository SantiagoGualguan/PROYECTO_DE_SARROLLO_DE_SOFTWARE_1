from unittest.mock import MagicMock
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory
from apps.cart.views import ShoppingCartViewSet, CartItemViewSet

factory = APIRequestFactory()


class ShoppingCartListTest(SimpleTestCase):
    def test_list_not_implemented(self):
        req = factory.get("/api/cart/")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = ShoppingCartViewSet.as_view({"get": "list"})
        with self.assertRaises(NotImplementedError):
            view(req)


class CartItemCreateTest(SimpleTestCase):
    def test_create_not_implemented(self):
        req = factory.post("/api/cart/items/", {"coreography_id": 1}, format="json")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = CartItemViewSet.as_view({"post": "create"})
        with self.assertRaises(NotImplementedError):
            view(req)


class CartItemDestroyTest(SimpleTestCase):
    def test_destroy_not_implemented(self):
        req = factory.delete("/api/cart/items/1/")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = CartItemViewSet.as_view({"delete": "destroy"})
        with self.assertRaises(NotImplementedError):
            view(req, pk=1)
