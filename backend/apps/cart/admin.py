from django.contrib import admin

from .models import CartItem, ShoppingCart


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ("coreography", "unit_price", "creation_date")
    readonly_fields = ("creation_date",)
    can_delete = True


@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    list_display = ("cart_id", "user", "s_status", "creation_date")
    list_filter = ("s_status",)
    search_fields = ("cart_id", "user__u_name", "user__last_name")
    ordering = ("-creation_date",)
    inlines = [CartItemInline]

    def has_add_permission(self, request):
        # El carrito nace siempre de add_to_cart(), no de un alta manual.
        return False


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart_item_id", "cart", "coreography", "unit_price", "creation_date")
    list_filter = ("creation_date",)
    search_fields = ("cart_item_id", "cart__cart_id", "coreography__c_name")
    ordering = ("-creation_date",)