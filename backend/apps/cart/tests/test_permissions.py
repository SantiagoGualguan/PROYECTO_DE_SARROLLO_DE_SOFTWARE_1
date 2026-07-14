from unittest.mock import MagicMock
from django.test import SimpleTestCase

from apps.cart.permissions import IsClientRole, IsCartOwner


def _make_request(u_type="client", is_authenticated=True, is_active=True, user_id=1):
    user = MagicMock()
    user.u_type = u_type
    user.is_authenticated = is_authenticated
    user.is_active = is_active
    user.id = user_id

    request = MagicMock()
    request.user = user
    return request


# ---------------------------------------------------------------------------
# IsClientRole
# ---------------------------------------------------------------------------


class IsClientRoleTest(SimpleTestCase):
    def setUp(self):
        self.permission = IsClientRole()
        self.view = MagicMock()

    def test_allows_authenticated_active_client(self):
        req = _make_request(u_type="client")
        self.assertTrue(self.permission.has_permission(req, self.view))

    def test_denies_admin_user(self):
        req = _make_request(u_type="admin")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_profesor_user(self):
        req = _make_request(u_type="profesor")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_director_user(self):
        req = _make_request(u_type="director")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_unauthenticated_user(self):
        req = _make_request(is_authenticated=False)
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_inactive_user(self):
        req = _make_request(is_active=False)
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_anonymous_user(self):
        req = MagicMock()
        req.user = None
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_error_message_is_set(self):
        self.assertTrue(len(self.permission.message) > 0)


# ---------------------------------------------------------------------------
# IsCartOwner
# ---------------------------------------------------------------------------


class IsCartOwnerTest(SimpleTestCase):
    def setUp(self):
        self.permission = IsCartOwner()
        self.view = MagicMock()

    def test_allows_owner_of_shopping_cart(self):
        cart = MagicMock()
        cart.user_id = 1
        cart.cart = None

        req = _make_request(user_id=1)
        self.assertTrue(
            self.permission.has_object_permission(req, self.view, cart)
        )

    def test_denies_non_owner_of_shopping_cart(self):
        cart = MagicMock()
        cart.user_id = 1
        cart.cart = None

        req = _make_request(user_id=2)
        self.assertFalse(
            self.permission.has_object_permission(req, self.view, cart)
        )

    def test_allows_owner_of_cart_item(self):
        item = MagicMock()
        item.user_id = None
        cart = MagicMock()
        cart.user_id = 1
        item.cart = cart

        req = _make_request(user_id=1)
        self.assertTrue(
            self.permission.has_object_permission(req, self.view, item)
        )

    def test_denies_non_owner_of_cart_item(self):
        item = MagicMock()
        item.user_id = None
        cart = MagicMock()
        cart.user_id = 1
        item.cart = cart

        req = _make_request(user_id=2)
        self.assertFalse(
            self.permission.has_object_permission(req, self.view, item)
        )

    def test_error_message_is_set(self):
        self.assertTrue(len(self.permission.message) > 0)
