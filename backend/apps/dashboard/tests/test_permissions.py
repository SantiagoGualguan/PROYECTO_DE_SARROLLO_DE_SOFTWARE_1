from unittest.mock import MagicMock
from django.test import SimpleTestCase

from apps.dashboard.permissions import IsAdminOrDirector, IsProfesor, IsCliente


def _make_request(u_type="admin", is_authenticated=True):
    user = MagicMock()
    user.u_type = u_type
    user.is_authenticated = is_authenticated

    request = MagicMock()
    request.user = user
    return request


# ---------------------------------------------------------------------------
# IsAdminOrDirector (dashboard version)
# ---------------------------------------------------------------------------


class DashboardIsAdminOrDirectorTest(SimpleTestCase):
    def setUp(self):
        self.permission = IsAdminOrDirector()
        self.view = MagicMock()

    def test_allows_admin(self):
        req = _make_request(u_type="admin")
        self.assertTrue(self.permission.has_permission(req, self.view))

    def test_allows_director(self):
        req = _make_request(u_type="director")
        self.assertTrue(self.permission.has_permission(req, self.view))

    def test_denies_client(self):
        req = _make_request(u_type="client")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_profesor(self):
        req = _make_request(u_type="profesor")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_unauthenticated(self):
        req = _make_request(is_authenticated=False)
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_anonymous_user(self):
        req = MagicMock()
        req.user = None
        self.assertFalse(self.permission.has_permission(req, self.view))


# ---------------------------------------------------------------------------
# IsProfesor (dashboard version)
# ---------------------------------------------------------------------------


class DashboardIsProfesorTest(SimpleTestCase):
    def setUp(self):
        self.permission = IsProfesor()
        self.view = MagicMock()

    def test_allows_profesor(self):
        req = _make_request(u_type="profesor")
        self.assertTrue(self.permission.has_permission(req, self.view))

    def test_denies_admin(self):
        req = _make_request(u_type="admin")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_client(self):
        req = _make_request(u_type="client")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_unauthenticated(self):
        req = _make_request(is_authenticated=False)
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_anonymous_user(self):
        req = MagicMock()
        req.user = None
        self.assertFalse(self.permission.has_permission(req, self.view))


# ---------------------------------------------------------------------------
# IsCliente (dashboard version)
# ---------------------------------------------------------------------------


class DashboardIsClienteTest(SimpleTestCase):
    def setUp(self):
        self.permission = IsCliente()
        self.view = MagicMock()

    def test_allows_client(self):
        req = _make_request(u_type="client")
        self.assertTrue(self.permission.has_permission(req, self.view))

    def test_denies_admin(self):
        req = _make_request(u_type="admin")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_profesor(self):
        req = _make_request(u_type="profesor")
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_unauthenticated(self):
        req = _make_request(is_authenticated=False)
        self.assertFalse(self.permission.has_permission(req, self.view))

    def test_denies_anonymous_user(self):
        req = MagicMock()
        req.user = None
        self.assertFalse(self.permission.has_permission(req, self.view))
