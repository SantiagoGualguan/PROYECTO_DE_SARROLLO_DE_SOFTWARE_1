from django.test import SimpleTestCase
from apps.sales.models import Purchase, UserCoreography, Bill


class PurchaseModelTest(SimpleTestCase):
    def test_str_representation(self):
        p = Purchase(purchase_id=5)
        self.assertEqual(str(p), "Purchase 5")

    def test_fields_exist(self):
        p = Purchase(purchase_id=1, cart_id=1)
        self.assertTrue(hasattr(p, "purchase_id"))
        self.assertTrue(hasattr(p, "cart_id"))
        self.assertTrue(hasattr(p, "purchase_date"))
        self.assertTrue(hasattr(p, "transaction_id"))


class UserCoreographyModelTest(SimpleTestCase):
    def test_str_representation(self):
        uc = UserCoreography()
        uc.user_id = 1
        uc.coreography_id = 2
        self.assertEqual(str(uc), "1 -> 2")

    def test_unique_together(self):
        meta = UserCoreography._meta
        self.assertIn(("user", "coreography"), meta.unique_together)


class BillModelTest(SimpleTestCase):
    def test_str_representation(self):
        b = Bill(bill_id=3)
        self.assertEqual(str(b), "Bill 3")

    def test_payment_choices(self):
        meta = Bill._meta
        field = meta.get_field("payment_method")
        choices = {c[0] for c in field.choices}
        self.assertEqual(choices, {"pse", "card"})
