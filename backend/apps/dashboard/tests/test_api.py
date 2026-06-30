from unittest.mock import MagicMock
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory
from apps.dashboard.views import (
    AdminDashboardView,
    ProfesorDashboardView,
    ClienteDashboardView,
)

factory = APIRequestFactory()


class AdminDashboardTest(SimpleTestCase):
    def test_get_not_implemented(self):
        req = factory.get("/api/dashboard/admin/")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = AdminDashboardView.as_view()
        with self.assertRaises(NotImplementedError):
            view(req)


class ProfesorDashboardTest(SimpleTestCase):
    def test_get_not_implemented(self):
        req = factory.get("/api/dashboard/profesor/")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = ProfesorDashboardView.as_view()
        with self.assertRaises(NotImplementedError):
            view(req)


class ClienteDashboardTest(SimpleTestCase):
    def test_get_not_implemented(self):
        req = factory.get("/api/dashboard/cliente/")
        req.user = MagicMock()
        req.user.is_authenticated = True
        view = ClienteDashboardView.as_view()
        with self.assertRaises(NotImplementedError):
            view(req)
