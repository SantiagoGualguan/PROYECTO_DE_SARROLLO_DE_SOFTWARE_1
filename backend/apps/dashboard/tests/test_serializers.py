from decimal import Decimal
from django.test import SimpleTestCase

from apps.dashboard.serializers import (
    MonthlySerializer,
    TopChoreographySerializer,
    ProfesorChoreographySerializer,
    AdminDashboardSerializer,
    ProfesorDashboardSerializer,
    ClienteDashboardSerializer,
)


class MonthlySerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = MonthlySerializer(data={"month": "2026-01", "count": 5})
        self.assertTrue(s.is_valid())

    def test_valid_data_with_revenue(self):
        s = MonthlySerializer(
            data={"month": "2026-01", "count": 5, "revenue": "50000.00"}
        )
        self.assertTrue(s.is_valid())
        self.assertEqual(s.validated_data["revenue"], 50000)

    def test_revenue_is_optional(self):
        s = MonthlySerializer(data={"month": "2026-01", "count": 3})
        self.assertTrue(s.is_valid())
        self.assertNotIn("revenue", s.validated_data)

    def test_missing_required_fields(self):
        s = MonthlySerializer(data={})
        self.assertFalse(s.is_valid())
        self.assertIn("month", s.errors)
        self.assertIn("count", s.errors)

    def test_invalid_count_type(self):
        s = MonthlySerializer(data={"month": "2026-01", "count": "abc"})
        self.assertFalse(s.is_valid())


class TopChoreographySerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = TopChoreographySerializer(
            data={
                "coreography_id": 1,
                "c_name": "Salsa",
                "times_sold": 15,
                "price": "10000.00",
                "revenue": "150000.00",
            }
        )
        self.assertTrue(s.is_valid())

    def test_missing_fields(self):
        s = TopChoreographySerializer(data={})
        self.assertFalse(s.is_valid())
        expected = {"coreography_id", "c_name", "times_sold", "price", "revenue"}
        self.assertTrue(expected.issubset(set(s.errors.keys())))

    def test_decimal_fields(self):
        s = TopChoreographySerializer(
            data={
                "coreography_id": 1,
                "c_name": "Test",
                "times_sold": 1,
                "price": "9999.99",
                "revenue": "9999.99",
            }
        )
        self.assertTrue(s.is_valid())
        self.assertEqual(s.validated_data["price"], Decimal("9999.99"))


class ProfesorChoreographySerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = ProfesorChoreographySerializer(
            data={
                "coreography_id": 1,
                "c_name": "Bachata",
                "times_sold": 8,
                "price": "15000.00",
                "revenue": "120000.00",
            }
        )
        self.assertTrue(s.is_valid())


class AdminDashboardSerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = AdminDashboardSerializer(
            data={
                "total_revenue": "100000.00",
                "total_users": 25,
                "total_choreographies": 10,
                "sales_this_month": 5,
                "revenue_this_month": "25000.00",
                "new_users_this_month": 3,
                "sales_by_month": [],
                "users_by_month": [],
                "top_choreographies": [],
                "users_by_role": {"admin": 2, "client": 20},
            }
        )
        self.assertTrue(s.is_valid())

    def test_missing_required_fields(self):
        s = AdminDashboardSerializer(data={})
        self.assertFalse(s.is_valid())
        expected = {
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
        }
        self.assertTrue(expected.issubset(set(s.errors.keys())))

    def test_nested_monthly_serializer(self):
        s = AdminDashboardSerializer(
            data={
                "total_revenue": "0",
                "total_users": 0,
                "total_choreographies": 0,
                "sales_this_month": 0,
                "revenue_this_month": "0",
                "new_users_this_month": 0,
                "sales_by_month": [{"month": "2026-01", "count": 1}],
                "users_by_month": [],
                "top_choreographies": [],
                "users_by_role": {},
            }
        )
        self.assertTrue(s.is_valid())
        self.assertEqual(len(s.validated_data["sales_by_month"]), 1)


class ProfesorDashboardSerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = ProfesorDashboardSerializer(
            data={
                "my_choreographies_count": 3,
                "total_sales": 15,
                "total_revenue": "150000.00",
                "choreographies": [],
                "sales_by_month": [],
            }
        )
        self.assertTrue(s.is_valid())

    def test_missing_required_fields(self):
        s = ProfesorDashboardSerializer(data={})
        self.assertFalse(s.is_valid())


class ClienteDashboardSerializerTest(SimpleTestCase):
    def test_valid_data(self):
        s = ClienteDashboardSerializer(
            data={
                "purchased_choreographies_count": 5,
                "total_spent": "50000.00",
                "purchase_count": 10,
                "owned_choreographies": [],
                "recent_purchases": [],
            }
        )
        self.assertTrue(s.is_valid())

    def test_missing_required_fields(self):
        s = ClienteDashboardSerializer(data={})
        self.assertFalse(s.is_valid())

    def test_nested_dict_fields(self):
        s = ClienteDashboardSerializer(
            data={
                "purchased_choreographies_count": 1,
                "total_spent": "10000",
                "purchase_count": 1,
                "owned_choreographies": [{"coreography_id": 1}],
                "recent_purchases": [{"purchase_id": 1}],
            }
        )
        self.assertTrue(s.is_valid())
        self.assertEqual(len(s.validated_data["owned_choreographies"]), 1)
