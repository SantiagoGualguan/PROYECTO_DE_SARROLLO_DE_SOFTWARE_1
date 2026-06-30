from unittest.mock import MagicMock
from django.test import SimpleTestCase
from django.http import HttpRequest
from apps.users.permissions import (
    IsAdmin,
    IsDirector,
    IsAdminOrDirector,
    IsProfesor,
    IsCliente,
)


def make_request(user=None, authenticated=False):
    request = HttpRequest()
    request.user = user or MagicMock()
    if authenticated:
        request.user.is_authenticated = True
    else:
        request.user.is_authenticated = False
    return request


def make_user(u_type):
    user = MagicMock()
    user.u_type = u_type
    return user


class IsAdminTest(SimpleTestCase):
    def test_admin_allowed(self):
        perm = IsAdmin()
        request = make_request(user=make_user("admin"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_director_denied(self):
        perm = IsAdmin()
        request = make_request(user=make_user("director"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))

    def test_profesor_denied(self):
        perm = IsAdmin()
        request = make_request(user=make_user("profesor"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))

    def test_client_denied(self):
        perm = IsAdmin()
        request = make_request(user=make_user("client"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))

    def test_unauthenticated_denied(self):
        perm = IsAdmin()
        request = make_request(user=make_user("admin"), authenticated=False)
        self.assertFalse(perm.has_permission(request, None))


class IsDirectorTest(SimpleTestCase):
    def test_director_allowed(self):
        perm = IsDirector()
        request = make_request(user=make_user("director"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_admin_denied(self):
        perm = IsDirector()
        request = make_request(user=make_user("admin"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))


class IsAdminOrDirectorTest(SimpleTestCase):
    def test_admin_allowed(self):
        perm = IsAdminOrDirector()
        request = make_request(user=make_user("admin"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_director_allowed(self):
        perm = IsAdminOrDirector()
        request = make_request(user=make_user("director"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_profesor_denied(self):
        perm = IsAdminOrDirector()
        request = make_request(user=make_user("profesor"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))

    def test_client_denied(self):
        perm = IsAdminOrDirector()
        request = make_request(user=make_user("client"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))

    def test_unauthenticated_denied(self):
        perm = IsAdminOrDirector()
        request = make_request(user=None, authenticated=False)
        self.assertFalse(perm.has_permission(request, None))


class IsProfesorTest(SimpleTestCase):
    def test_profesor_allowed(self):
        perm = IsProfesor()
        request = make_request(user=make_user("profesor"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_admin_denied(self):
        perm = IsProfesor()
        request = make_request(user=make_user("admin"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))


class IsClienteTest(SimpleTestCase):
    def test_client_allowed(self):
        perm = IsCliente()
        request = make_request(user=make_user("client"), authenticated=True)
        self.assertTrue(perm.has_permission(request, None))

    def test_admin_denied(self):
        perm = IsCliente()
        request = make_request(user=make_user("admin"), authenticated=True)
        self.assertFalse(perm.has_permission(request, None))
