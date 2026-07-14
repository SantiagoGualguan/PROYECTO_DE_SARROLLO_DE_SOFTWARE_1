from unittest.mock import MagicMock, patch, PropertyMock
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.cart.views import (
    ShoppingCartView,
    CartItemListCreateView,
    CartItemDetailView,
)

factory = APIRequestFactory()


def _make_user(user_id=1, u_type="client"):
    user = MagicMock()
    user.id = user_id
    user.pk = user_id
    user.u_type = u_type
    user.is_authenticated = True
    user.is_active = True
    return user


def _make_cart(cart_id=1, user=None, s_status="active", items=None):
    cart = MagicMock()
    cart.cart_id = cart_id
    cart.user = user or _make_user()
    cart.user_id = cart.user.id
    cart.s_status = s_status
    cart.save = MagicMock()
    cart_items = MagicMock()
    cart_items.all.return_value = items or []
    cart.items = cart_items
    return cart


def _make_cart_item(cart_item_id=1, coreography_id=10, unit_price="25000.00"):
    item = MagicMock()
    item.cart_item_id = cart_item_id
    item.coreography_id = coreography_id
    item.unit_price = unit_price
    item.delete = MagicMock()
    return item


# ---------------------------------------------------------------------------
# ShoppingCartView (GET + DELETE)
# ---------------------------------------------------------------------------


class ShoppingCartViewGetTest(SimpleTestCase):
    @patch("apps.cart.views._get_active_cart")
    @patch("apps.cart.views.ShoppingCartSerializer")
    def test_get_returns_cart(self, mock_serializer, mock_get_cart):
        cart = _make_cart()
        mock_get_cart.return_value = cart
        mock_serializer.return_value.data = {
            "cart_id": 1,
            "items": [],
            "total": 0,
        }

        req = factory.get("/api/cart/cart/")
        force_authenticate(req, user=_make_user())
        view = ShoppingCartView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cart_id"], 1)

    @patch("apps.cart.views._get_active_cart")
    def test_get_returns_404_when_no_cart(self, mock_get_cart):
        mock_get_cart.return_value = None

        req = factory.get("/api/cart/cart/")
        force_authenticate(req, user=_make_user())
        view = ShoppingCartView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No tienes un carrito activo", response.data["detail"])


class ShoppingCartViewDeleteTest(SimpleTestCase):
    @patch("apps.cart.views.CartItem.objects")
    @patch("apps.cart.views._get_active_cart")
    @patch("apps.cart.views.transaction")
    def test_delete_clears_cart_items(self, mock_transaction, mock_get_cart, mock_cart_item_objects):
        cart = _make_cart()
        mock_get_cart.return_value = cart
        mock_cart_item_objects.filter.return_value.delete = MagicMock()

        req = factory.delete("/api/cart/cart/")
        force_authenticate(req, user=_make_user())
        view = ShoppingCartView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @patch("apps.cart.views._get_active_cart")
    def test_delete_returns_404_when_no_cart(self, mock_get_cart):
        mock_get_cart.return_value = None

        req = factory.delete("/api/cart/cart/")
        force_authenticate(req, user=_make_user())
        view = ShoppingCartView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# CartItemListCreateView (POST - add to cart via stored procedure)
# ---------------------------------------------------------------------------


class CartItemListCreateViewPostTest(SimpleTestCase):
    @patch("apps.cart.views.get_object_or_404")
    @patch("apps.cart.views._get_active_cart")
    @patch("apps.cart.views.connection")
    @patch("apps.cart.views.ShoppingCartSerializer")
    @patch("apps.cart.views.CartItem.objects")
    def test_post_adds_item_to_existing_cart(
        self, mock_cart_item_objects, mock_serializer, mock_connection, mock_get_cart, mock_get_object_or_404
    ):
        coreography = MagicMock()
        coreography.pk = 10
        coreography.price = "25000.00"
        mock_get_object_or_404.return_value = coreography

        cart_before = _make_cart(items=[])
        cart_after = _make_cart(items=[_make_cart_item()])
        call_count = [0]

        def _get_active_cart_side_effect(user_id, for_write=False):
            call_count[0] += 1
            if call_count[0] == 1:
                return cart_before
            return cart_after

        mock_get_cart.side_effect = _get_active_cart_side_effect
        mock_cart_item_objects.filter.return_value.count.side_effect = [0, 1]

        cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = cursor

        mock_serializer.return_value.data = {"cart_id": 1, "items": [{"cart_item_id": 1}], "total": 25000}

        req = factory.post(
            "/api/cart/cart/items/",
            {"coreography_id": 10},
            format="json",
        )
        force_authenticate(req, user=_make_user())
        view = CartItemListCreateView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cursor.execute.assert_called_once()

    @patch("apps.cart.views.get_object_or_404")
    @patch("apps.cart.views._get_active_cart")
    @patch("apps.cart.views.connection")
    @patch("apps.cart.views.CartItem.objects")
    def test_post_returns_400_when_sp_fails(
        self, mock_cart_item_objects, mock_connection, mock_get_cart, mock_get_object_or_404
    ):
        coreography = MagicMock()
        coreography.pk = 10
        coreography.price = "25000.00"
        mock_get_object_or_404.return_value = coreography

        cart_empty = _make_cart(items=[])
        mock_get_cart.return_value = cart_empty
        mock_cart_item_objects.filter.return_value.count.return_value = 0

        cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = cursor

        req = factory.post(
            "/api/cart/cart/items/",
            {"coreography_id": 10},
            format="json",
        )
        force_authenticate(req, user=_make_user())
        view = CartItemListCreateView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_rejects_missing_coreography_id(self):
        req = factory.post("/api/cart/cart/items/", {}, format="json")
        force_authenticate(req, user=_make_user())
        view = CartItemListCreateView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_rejects_invalid_coreography_id(self):
        req = factory.post(
            "/api/cart/cart/items/", {"coreography_id": -1}, format="json"
        )
        force_authenticate(req, user=_make_user())
        view = CartItemListCreateView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# CartItemDetailView (DELETE - remove single item)
# ---------------------------------------------------------------------------


class CartItemDetailViewDeleteTest(SimpleTestCase):
    @patch("apps.cart.views.get_object_or_404")
    def test_delete_removes_item(self, mock_get_object_or_404):
        item = _make_cart_item()
        mock_get_object_or_404.return_value = item

        req = factory.delete("/api/cart/cart/items/1/")
        force_authenticate(req, user=_make_user())
        view = CartItemDetailView.as_view()
        response = view(req, pk=1)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        item.delete.assert_called_once()

    @patch("apps.cart.views.get_object_or_404")
    def test_delete_returns_404_when_item_not_found(self, mock_get_object_or_404):
        from django.http import Http404

        mock_get_object_or_404.side_effect = Http404

        req = factory.delete("/api/cart/cart/items/999/")
        force_authenticate(req, user=_make_user())
        view = CartItemDetailView.as_view()
        response = view(req, pk=999)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# _get_active_cart helper
# ---------------------------------------------------------------------------


class GetActiveCartHelperTest(SimpleTestCase):
    @patch("apps.cart.views.ShoppingCart.objects")
    def test_returns_active_cart(self, mock_objects):
        from apps.cart.views import _get_active_cart

        cart = _make_cart()
        qs = MagicMock()
        qs.first.return_value = cart
        qs.prefetch_related.return_value = qs
        mock_objects.filter.return_value = qs

        result = _get_active_cart(1)

        self.assertEqual(result, cart)
        mock_objects.filter.assert_called_with(user_id=1, s_status="active")

    @patch("apps.cart.views.ShoppingCart.objects")
    def test_returns_none_when_no_active_cart(self, mock_objects):
        from apps.cart.views import _get_active_cart

        qs = MagicMock()
        qs.first.return_value = None
        qs.prefetch_related.return_value = qs
        mock_objects.filter.return_value = qs

        result = _get_active_cart(1)

        self.assertIsNone(result)

    @patch("apps.cart.views.ShoppingCart.objects")
    def test_for_write_skips_prefetch(self, mock_objects):
        from apps.cart.views import _get_active_cart

        qs = MagicMock()
        qs.first.return_value = None
        mock_objects.filter.return_value = qs

        _get_active_cart(1, for_write=True)

        qs.prefetch_related.assert_not_called()
