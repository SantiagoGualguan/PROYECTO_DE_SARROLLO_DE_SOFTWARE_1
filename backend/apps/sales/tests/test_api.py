from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.sales.views import PurchaseViewSet

factory = APIRequestFactory()


def _make_user(user_id=1):
    user = MagicMock()
    user.id = user_id
    user.pk = user_id
    user.is_authenticated = True
    user.is_active = True
    user.u_type = "client"
    return user


def _make_cart_item(
    cart_item_id=1,
    coreography_id=10,
    c_name="Test Dance",
    unit_price="25000.00",
):
    coreography = MagicMock()
    coreography.coreography_id = coreography_id
    coreography.c_name = c_name
    coreography.price = unit_price
    coreography.song_genre = "salsa"
    coreography.dificulty_level = "basic"
    coreography.times_sold = 0
    coreography.save = MagicMock()

    item = MagicMock()
    item.cart_item_id = cart_item_id
    item.coreography_id = coreography_id
    item.coreography = coreography
    item.unit_price = unit_price
    return item


def _make_cart(cart_id=1, user=None, items=None):
    cart = MagicMock()
    cart.cart_id = cart_id
    cart.user = user or _make_user()
    cart.user_id = cart.user.id
    cart.s_status = "active"
    cart.save = MagicMock()

    items_queryset = MagicMock()
    items_queryset.select_related.return_value = items_queryset
    items_queryset.all.return_value = items or []
    cart.items = items_queryset
    return cart


class PurchaseViewSetTest(SimpleTestCase):
    def setUp(self):
        self.user = _make_user()

    def _build_request(self, method, path, data=None):
        if method == "get":
            request = factory.get(path, data=data or {})
        elif method == "post":
            request = factory.post(path, data=data or {}, format="json")
        elif method == "put":
            request = factory.put(path, data=data or {}, format="json")
        elif method == "patch":
            request = factory.patch(path, data=data or {}, format="json")
        elif method == "delete":
            request = factory.delete(path)
        else:
            request = factory.get(path)

        force_authenticate(request, user=self.user)
        request.session = {}
        return request

    @patch.object(PurchaseViewSet, "_serialize_purchase", return_value={"purchase_id": 1})
    @patch("apps.sales.views.Purchase.objects")
    def test_list_returns_history(self, mock_objects, mock_serialize_purchase):
        purchase = MagicMock()
        qs = MagicMock()
        qs.select_related.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.order_by.return_value = qs
        qs.__iter__.return_value = [purchase]
        mock_objects.filter.return_value = qs

        request = self._build_request("get", "/api/sales/")
        response = PurchaseViewSet.as_view({"get": "list"})(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"], [{"purchase_id": 1}])
        mock_objects.filter.assert_called_once_with(cart__user=self.user)

    @patch.object(PurchaseViewSet, "confirm_payment")
    def test_create_delegates_to_confirm_payment(self, mock_confirm_payment):
        expected_response = Response({"detail": "ok"}, status=status.HTTP_200_OK)
        mock_confirm_payment.return_value = expected_response

        request = self._build_request("post", "/api/sales/", {})
        response = PurchaseViewSet.as_view({"post": "create"})(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"detail": "ok"})
        mock_confirm_payment.assert_called_once()

    @patch.object(PurchaseViewSet, "_serialize_purchase", return_value={"purchase_id": 7})
    @patch("apps.sales.views.Purchase.objects")
    def test_retrieve_returns_purchase(self, mock_objects, mock_serialize_purchase):
        purchase = MagicMock()
        purchase.purchase_id = 7
        qs = MagicMock()
        qs.select_related.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.first.return_value = purchase
        mock_objects.filter.return_value = qs

        request = self._build_request("get", "/api/sales/7/")
        response = PurchaseViewSet.as_view({"get": "retrieve"})(request, pk=7)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"purchase_id": 7})
        mock_objects.filter.assert_called_once()

    @patch("apps.sales.views.ShoppingCart.objects")
    def test_confirm_items_returns_summary(self, mock_objects):
        user = _make_user()
        cart = _make_cart(user=user, items=[_make_cart_item(), _make_cart_item(cart_item_id=2, coreography_id=11, c_name="Second Dance", unit_price="10000.00")])
        qs = MagicMock()
        qs.select_related.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.filter.return_value = qs
        qs.first.return_value = cart
        mock_objects.select_related.return_value = qs

        request = self._build_request("post", "/api/sales/confirm-items/", {"cart_id": 1})
        response = PurchaseViewSet.as_view({"post": "confirm_items"})(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cart_id"], 1)
        self.assertEqual(response.data["total_amount"], "35000.00")
        self.assertIn("sales_checkout", request.session)
        self.assertEqual(request.session["sales_checkout"]["cart_id"], 1)

    def test_confirm_billing_stores_session(self):
        request = self._build_request(
            "post",
            "/api/sales/confirm-billing/",
            {
                "cart_id": 1,
                "email_address": "buyer@test.com",
                "titular_name": "Buyer Name",
                "document_number": "100200300",
                "details": "Factura demo",
            },
        )
        response = PurchaseViewSet.as_view({"post": "confirm_billing"})(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["billing"]["email_address"], "buyer@test.com")
        self.assertEqual(request.session["sales_checkout"]["cart_id"], 1)
        self.assertEqual(request.session["sales_checkout"]["billing"]["titular_name"], "Buyer Name")

    def test_confirm_payment_rejects_non_client_user(self):
        non_client = _make_user()
        non_client.u_type = "admin"

        request = factory.post("/api/sales/confirm-payment/", {}, format="json")
        force_authenticate(request, user=non_client)
        request.session = {}

        response = PurchaseViewSet.as_view({"post": "confirm_payment"})(request)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch.object(PurchaseViewSet, "_serialize_bill", return_value={"id": 9})
    @patch.object(PurchaseViewSet, "_serialize_purchase", return_value={"purchase_id": 8})
    @patch("apps.sales.views.UserCoreography.objects")
    @patch("apps.sales.views.Bill.objects")
    @patch("apps.sales.views.Purchase.objects")
    @patch("apps.sales.views.stripe.PaymentIntent.create")
    @patch("apps.sales.views.stripe.Refund.create")
    @patch("apps.sales.views.ShoppingCart.objects")
    @patch("apps.sales.views.transaction.atomic")
    def test_confirm_payment_creates_records(
        self,
        mock_atomic,
        mock_cart_objects,
        mock_refund_create,
        mock_payment_intent_create,
        mock_purchase_objects,
        mock_bill_objects,
        mock_user_coreography_objects,
        mock_serialize_purchase,
        mock_serialize_bill,
    ):
        mock_atomic.return_value.__enter__.return_value = None
        mock_atomic.return_value.__exit__.return_value = False

        cart = _make_cart(
            cart_id=1,
            user=self.user,
            items=[_make_cart_item(unit_price="19.99")],
        )
        qs = MagicMock()
        qs.select_related.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.filter.return_value = qs
        qs.first.return_value = cart
        mock_cart_objects.select_related.return_value = qs

        intent = MagicMock()
        intent.id = "pi_123"
        intent.status = "succeeded"
        mock_payment_intent_create.return_value = intent

        purchase = MagicMock()
        purchase.purchase_id = 8
        purchase.cart_id = 1
        purchase.purchase_date = None
        purchase.save = MagicMock()
        mock_purchase_objects.get_or_create.return_value = (purchase, True)

        bill = MagicMock()
        bill.bill_id = 9
        bill.total_amount = 19.99
        bill.payment_method = "pse"
        bill.email_address = "buyer@test.com"
        bill.titular_name = "Buyer Name"
        bill.document_number = "100200300"
        bill.details = "Factura demo"
        mock_bill_objects.get_or_create.return_value = (bill, True)

        request = self._build_request(
            "post",
            "/api/sales/confirm-payment/",
            {
                "cart_id": 1,
                "amount": 1,
                "payment_method": "pm_card_visa",
                "currency": "usd",
                "email_address": "buyer@test.com",
                "titular_name": "Buyer Name",
                "document_number": "100200300",
                "details": "Factura demo",
                "bill_payment_method": "pse",
            },
        )
        response = PurchaseViewSet.as_view({"post": "confirm_payment"})(request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["payment_intent_id"], "pi_123")
        self.assertEqual(response.data["status"], "succeeded")
        mock_payment_intent_create.assert_called_once()
        self.assertEqual(mock_payment_intent_create.call_args.kwargs["amount"], 1999)
        self.assertEqual(mock_payment_intent_create.call_args.kwargs["payment_method"], "pm_card_visa")
        mock_purchase_objects.get_or_create.assert_called_once()
        purchase_call = mock_purchase_objects.get_or_create.call_args
        self.assertEqual(purchase_call.kwargs["transaction_id"], "pi_123")
        self.assertEqual(purchase_call.kwargs["defaults"]["cart"], cart)
        mock_bill_objects.get_or_create.assert_called_once()
        self.assertEqual(mock_bill_objects.get_or_create.call_args.kwargs["defaults"]["payment_method"], "pse")
        mock_user_coreography_objects.update_or_create.assert_called_once()
        self.assertEqual(cart.s_status, "completed")

    @patch.object(PurchaseViewSet, "_serialize_bill", return_value={"id": 9})
    @patch.object(PurchaseViewSet, "_serialize_purchase", return_value={"purchase_id": 8})
    @patch("apps.sales.views.Bill.objects")
    @patch("apps.sales.views.Purchase.objects")
    @patch("apps.sales.views.stripe.Refund.create")
    @patch("apps.sales.views.stripe.PaymentIntent.create")
    @patch("apps.sales.views.ShoppingCart.objects")
    @patch("apps.sales.views.transaction.atomic")
    def test_confirm_payment_refunds_when_finalize_fails(
        self,
        mock_atomic,
        mock_cart_objects,
        mock_payment_intent_create,
        mock_refund_create,
        mock_purchase_objects,
        mock_bill_objects,
        mock_serialize_purchase,
        mock_serialize_bill,
    ):
        mock_atomic.return_value.__enter__.return_value = None
        mock_atomic.return_value.__exit__.return_value = False

        cart = _make_cart(cart_id=1, user=self.user, items=[_make_cart_item(unit_price="19.99")])
        qs = MagicMock()
        qs.select_related.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.filter.return_value = qs
        qs.first.return_value = cart
        mock_cart_objects.select_related.return_value = qs

        intent = MagicMock()
        intent.id = "pi_456"
        intent.status = "succeeded"
        mock_payment_intent_create.return_value = intent

        mock_purchase_objects.get_or_create.side_effect = ValueError("db failed")

        request = self._build_request(
            "post",
            "/api/sales/confirm-payment/",
            {
                "cart_id": 1,
                "payment_method": "pm_card_visa",
                "currency": "usd",
                "email_address": "buyer@test.com",
                "titular_name": "Buyer Name",
                "document_number": "100200300",
                "details": "Factura demo",
            },
        )
        response = PurchaseViewSet.as_view({"post": "confirm_payment"})(request)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertTrue(response.data["refund_attempted"])
        mock_refund_create.assert_called_once_with(payment_intent="pi_456")
