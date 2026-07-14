from decimal import Decimal
from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.dashboard.views import (
    AdminDashboardView,
    ProfesorDashboardView,
    ClienteDashboardView,
    EMPTY_RESPONSE,
)

factory = APIRequestFactory()


def _make_user(user_id=1, u_type="admin"):
    user = MagicMock()
    user.id = user_id
    user.pk = user_id
    user.u_type = u_type
    user.is_authenticated = True
    user.is_active = True
    return user


# ---------------------------------------------------------------------------
# AdminDashboardView
# ---------------------------------------------------------------------------


class AdminDashboardViewTest(SimpleTestCase):
    def setUp(self):
        self.user = _make_user(u_type="admin")

    @patch("apps.dashboard.views.connection")
    def test_get_returns_dashboard_data(self, mock_connection):
        cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = cursor

        cursor.fetchone.return_value = (100000, 25, 10, 5, 25000, 3)
        cursor.fetchall.side_effect = [
            [("2026-01", 3, 50000), ("2026-02", 2, 30000)],
            [("2026-01", 5), ("2026-02", 8)],
            [(1, "Salsa Basica", 15, "10000.00", "150000.00")],
            [("admin", 2), ("client", 20)],
        ]

        req = factory.get("/api/dashboard/admin/")
        force_authenticate(req, user=self.user)
        view = AdminDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_users"], 25)
        self.assertEqual(response.data["total_choreographies"], 10)
        self.assertEqual(response.data["sales_this_month"], 5)
        self.assertEqual(response.data["new_users_this_month"], 3)
        self.assertEqual(len(response.data["sales_by_month"]), 2)
        self.assertEqual(len(response.data["users_by_month"]), 2)
        self.assertEqual(len(response.data["top_choreographies"]), 1)
        self.assertEqual(response.data["users_by_role"], {"admin": 2, "client": 20})

    @patch("apps.dashboard.views.connection")
    def test_get_returns_empty_data_on_db_error(self, mock_connection):
        from django.db.utils import DatabaseError

        mock_connection.cursor.return_value.__enter__.side_effect = DatabaseError

        req = factory.get("/api/dashboard/admin/")
        force_authenticate(req, user=self.user)
        view = AdminDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_users"], 0)
        self.assertEqual(response.data["total_choreographies"], 0)
        self.assertIn("detail", response.data)


# ---------------------------------------------------------------------------
# ProfesorDashboardView
# ---------------------------------------------------------------------------


class ProfesorDashboardViewTest(SimpleTestCase):
    def setUp(self):
        self.user = _make_user(user_id=10, u_type="profesor")

    @patch("apps.dashboard.views.connection")
    @patch("apps.dashboard.views.Profesor.objects")
    def test_get_returns_dashboard_data(self, mock_profesor_objects, mock_connection):
        profesor = MagicMock()
        profesor.user_id = 10
        mock_profesor_objects.filter.return_value.first.return_value = profesor

        cursor = MagicMock()
        mock_connection.cursor.return_value.__enter__.return_value = cursor

        cursor.fetchone.return_value = (3, 15, "150000.00")
        cursor.fetchall.side_effect = [
            [(1, "Salsa", 10, "10000.00", "100000.00"), (2, "Bachata", 5, "10000.00", "50000.00")],
            [("2026-01", 8, "80000.00")],
        ]

        req = factory.get("/api/dashboard/profesor/")
        force_authenticate(req, user=self.user)
        view = ProfesorDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["my_choreographies_count"], 3)
        self.assertEqual(response.data["total_sales"], 15)
        self.assertEqual(len(response.data["choreographies"]), 2)
        self.assertEqual(len(response.data["sales_by_month"]), 1)

    @patch("apps.dashboard.views.Profesor.objects")
    def test_get_returns_404_when_no_profesor_profile(self, mock_profesor_objects):
        mock_profesor_objects.filter.return_value.first.return_value = None

        req = factory.get("/api/dashboard/profesor/")
        force_authenticate(req, user=self.user)
        view = ProfesorDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Perfil de profesor no encontrado", response.data["detail"])

    @patch("apps.dashboard.views.connection")
    @patch("apps.dashboard.views.Profesor.objects")
    def test_get_returns_empty_data_on_db_error(
        self, mock_profesor_objects, mock_connection
    ):
        from django.db.utils import DatabaseError

        profesor = MagicMock()
        profesor.user_id = 10
        mock_profesor_objects.filter.return_value.first.return_value = profesor
        mock_connection.cursor.return_value.__enter__.side_effect = DatabaseError

        req = factory.get("/api/dashboard/profesor/")
        force_authenticate(req, user=self.user)
        view = ProfesorDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)


# ---------------------------------------------------------------------------
# ClienteDashboardView
# ---------------------------------------------------------------------------


class ClienteDashboardViewTest(SimpleTestCase):
    def setUp(self):
        self.user = _make_user(user_id=5, u_type="client")

    @patch("apps.dashboard.views.Bill.objects")
    @patch("apps.dashboard.views.Purchase.objects")
    @patch("apps.dashboard.views.UserCoreography.objects")
    def test_get_returns_dashboard_data(
        self, mock_uc_objects, mock_purchase_objects, mock_bill_objects
    ):
        owned_qs = MagicMock()
        owned_qs.select_related.return_value = owned_qs
        owned_qs.order_by.return_value = owned_qs
        owned_qs.count.return_value = 0
        owned_qs.__iter__ = MagicMock(return_value=iter([]))
        mock_uc_objects.filter.return_value = owned_qs

        purchases_qs = MagicMock()
        purchases_qs.select_related.return_value = purchases_qs
        purchases_qs.prefetch_related.return_value = purchases_qs
        purchases_qs.order_by.return_value = purchases_qs
        purchases_qs.count.return_value = 0
        purchases_qs.__iter__ = MagicMock(return_value=iter([]))
        mock_purchase_objects.filter.return_value = purchases_qs

        mock_bill_objects.filter.return_value.aggregate.return_value = {"total": None}

        req = factory.get("/api/dashboard/cliente/")
        force_authenticate(req, user=self.user)
        view = ClienteDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["purchased_choreographies_count"], 0)
        self.assertEqual(response.data["total_spent"], Decimal("0.00"))
        self.assertEqual(response.data["purchase_count"], 0)
        self.assertEqual(response.data["owned_choreographies"], [])
        self.assertEqual(response.data["recent_purchases"], [])

    @patch("apps.dashboard.views.Bill.objects")
    @patch("apps.dashboard.views.Purchase.objects")
    @patch("apps.dashboard.views.UserCoreography.objects")
    def test_get_returns_empty_data_on_db_error(
        self, mock_uc_objects, mock_purchase_objects, mock_bill_objects
    ):
        from django.db.utils import DatabaseError

        mock_uc_objects.filter.side_effect = DatabaseError

        req = factory.get("/api/dashboard/cliente/")
        force_authenticate(req, user=self.user)
        view = ClienteDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)

    @patch("apps.dashboard.views.Bill.objects")
    @patch("apps.dashboard.views.Purchase.objects")
    @patch("apps.dashboard.views.UserCoreography.objects")
    def test_get_returns_owned_choreographies(
        self, mock_uc_objects, mock_purchase_objects, mock_bill_objects
    ):
        coreography = MagicMock()
        coreography.coreography_id = 1
        coreography.c_name = "Salsa"
        coreography.c_description = "Basica"
        coreography.image_url = None
        coreography.song_genre = "salsa"
        coreography.dificulty_level = "basic"
        coreography.price = "10000.00"
        coreography.creation_date = None

        uc = MagicMock()
        uc.coreography_id = 1
        uc.coreography = coreography

        owned_qs = MagicMock()
        owned_qs.select_related.return_value = owned_qs
        owned_qs.order_by.return_value = owned_qs
        owned_qs.count.return_value = 1
        owned_qs.__iter__ = MagicMock(return_value=iter([uc]))
        mock_uc_objects.filter.return_value = owned_qs

        purchases_qs = MagicMock()
        purchases_qs.select_related.return_value = purchases_qs
        purchases_qs.prefetch_related.return_value = purchases_qs
        purchases_qs.order_by.return_value = purchases_qs
        purchases_qs.count.return_value = 0
        purchases_qs.__iter__ = MagicMock(return_value=iter([]))
        mock_purchase_objects.filter.return_value = purchases_qs

        mock_bill_objects.filter.return_value.aggregate.return_value = {"total": None}

        req = factory.get("/api/dashboard/cliente/")
        force_authenticate(req, user=self.user)
        view = ClienteDashboardView.as_view()
        response = view(req)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["purchased_choreographies_count"], 1)
        self.assertEqual(len(response.data["owned_choreographies"]), 1)
        self.assertEqual(response.data["owned_choreographies"][0]["c_name"], "Salsa")


# ---------------------------------------------------------------------------
# EMPTY_RESPONSE constant
# ---------------------------------------------------------------------------


class EmptyResponseConstantTest(SimpleTestCase):
    def test_empty_response_has_all_keys(self):
        expected_keys = {
            "total_revenue",
            "total_users",
            "total_choreographies",
            "sales_this_month",
            "revenue_this_month",
            "new_users_this_month",
            "sales_by_month",
            "users_by_month",
            "top_choreographies",
            "users_by_role",
            "purchased_choreographies_count",
            "total_spent",
            "purchase_count",
            "owned_choreographies",
            "recent_purchases",
            "my_choreographies_count",
            "total_sales",
            "choreographies",
        }
        self.assertEqual(set(EMPTY_RESPONSE.keys()), expected_keys)

    def test_empty_response_numeric_values_are_zero(self):
        self.assertEqual(EMPTY_RESPONSE["total_users"], 0)
        self.assertEqual(EMPTY_RESPONSE["total_choreographies"], 0)
        self.assertEqual(EMPTY_RESPONSE["sales_this_month"], 0)
        self.assertEqual(EMPTY_RESPONSE["purchase_count"], 0)

    def test_empty_response_list_values_are_empty(self):
        self.assertEqual(EMPTY_RESPONSE["sales_by_month"], [])
        self.assertEqual(EMPTY_RESPONSE["top_choreographies"], [])
        self.assertEqual(EMPTY_RESPONSE["owned_choreographies"], [])
        self.assertEqual(EMPTY_RESPONSE["recent_purchases"], [])
