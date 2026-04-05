from django.db import models

from apps.users.models import CustomUser
from apps.choreographies.models import Coreography


class ShoppingCart(models.Model):
    STATUS_CHOICES = [
        ("active", "activo"),
        ("completed", "completado"),
        ("cancelled", "cancelado"),
    ]

    cart_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        CustomUser,
        db_column="u_id",
        related_name="shopping_carts",
        on_delete=models.DO_NOTHING,
    )
    s_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    creation_date = models.DateTimeField(db_column="creation_date", null=True, blank=True)

    class Meta:
        managed = False
        db_table = "shopping_cart"

    def __str__(self):
        return f"Cart {self.cart_id} ({self.s_status})"


class CartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(
        ShoppingCart,
        db_column="cart_id",
        related_name="items",
        on_delete=models.DO_NOTHING,
    )
    coreography = models.ForeignKey(
        Coreography,
        db_column="coreography_id",
        related_name="cart_items",
        on_delete=models.DO_NOTHING,
    )
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    creation_date = models.DateTimeField(db_column="creation_date", null=True, blank=True)

    class Meta:
        managed = False
        db_table = "cart_item"

    def __str__(self):
        return f"CartItem {self.cart_item_id}"

