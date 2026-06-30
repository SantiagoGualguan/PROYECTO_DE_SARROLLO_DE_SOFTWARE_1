from unittest.mock import MagicMock
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory
from apps.sales.views import PurchaseViewSet

factory = APIRequestFactory()


class PurchaseViewSetTest(SimpleTestCase):
    def setUp(self):
        self.user = MagicMock()
        self.user.is_authenticated = True

    def test_list_not_implemented(self):
        req = factory.get("/api/sales/")
        req.user = self.user
        view = PurchaseViewSet.as_view({"get": "list"})
        with self.assertRaises(NotImplementedError):
            view(req)

    def test_create_not_implemented(self):
        req = factory.post("/api/sales/", {}, format="json")
        req.user = self.user
        view = PurchaseViewSet.as_view({"post": "create"})
        with self.assertRaises(NotImplementedError):
            view(req)

    def test_retrieve_not_implemented(self):
        req = factory.get("/api/sales/1/")
        req.user = self.user
        view = PurchaseViewSet.as_view({"get": "retrieve"})
        with self.assertRaises(NotImplementedError):
            view(req, pk=1)

    def test_confirm_items_not_implemented(self):
        req = factory.post("/api/sales/confirm-items/", {}, format="json")
        req.user = self.user
        view = PurchaseViewSet.as_view({"post": "confirm_items"})
        with self.assertRaises(NotImplementedError):
            view(req)

    def test_confirm_billing_not_implemented(self):
        req = factory.post("/api/sales/confirm-billing/", {}, format="json")
        req.user = self.user
        view = PurchaseViewSet.as_view({"post": "confirm_billing"})
        with self.assertRaises(NotImplementedError):
            view(req)

    def test_confirm_payment_not_implemented(self):
        req = factory.post("/api/sales/confirm-payment/", {}, format="json")
        req.user = self.user
        view = PurchaseViewSet.as_view({"post": "confirm_payment"})
        with self.assertRaises(NotImplementedError):
            view(req)
