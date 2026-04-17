from django.db import models

from apps.users.models import CustomUser
from apps.choreographies.models import Coreography
from apps.cart.models import ShoppingCart
"""
models for the sales app contains the models related to 
purchases, bills, and the relationship between users 
and coreographies they have access to, after purchase"
"""

"purchases table contains the purchases made by users, linked to a shopping cart and containing purchase details"
class Purchase(models.Model):
    purchase_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(
        ShoppingCart,
        db_column="cart_id",
        related_name="purchases",
        on_delete=models.DO_NOTHING,
    )
    purchase_date = models.DateTimeField(db_column="purchase_date", null=True, blank=True)
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)

    class Meta:
        managed = False 
        db_table = "purchase"

    def __str__(self):
        return f"Purchase {self.purchase_id}"

"user_coreography table contains the relationship between users and coreographies they have access to"
class UserCoreography(models.Model):
    user = models.ForeignKey(
        CustomUser,
        db_column="u_id",
        related_name="coreographies",
        on_delete=models.DO_NOTHING,
    )
    coreography = models.ForeignKey(
        Coreography,
        db_column="coreography_id",
        related_name="users",
        on_delete=models.DO_NOTHING,
    )
    purchase = models.ForeignKey(
        Purchase,
        db_column="purchase_id",
        related_name="user_coreographies",
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
    )

    class Meta:
        managed = False
        db_table = "user_coreography"
        unique_together = [("user", "coreography")]

    def __str__(self):
        return f"{self.user_id} -> {self.coreography_id}"


"bills table contains the bills generated for each purchase, with payment details"
class Bill(models.Model):
    PAYMENT_CHOICES = [
        ("pse", "pse"),
        ("card", "card"), #payment methods: PSE, card, etc.
    ]

    bill_id = models.AutoField(primary_key=True)
    purchase = models.ForeignKey(
        Purchase,
        db_column="purchase_id",
        related_name="bills",
        on_delete=models.DO_NOTHING,
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES)
    creation_date = models.DateTimeField(db_column="creation_date", null=True, blank=True)
    email_address = models.CharField(max_length=100)
    titular_name = models.CharField(max_length=100)
    document_number = models.CharField(max_length=50)
    details = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "bill"

    def __str__(self):
        return f"Bill {self.bill_id}"

