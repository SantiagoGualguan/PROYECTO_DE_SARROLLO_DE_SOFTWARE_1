from django.contrib import admin

from .models import ShoppingCart, CartItem


@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

