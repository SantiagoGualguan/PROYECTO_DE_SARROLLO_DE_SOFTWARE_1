from django.contrib import admin

from .models import Carrito, ItemCarrito


@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(ItemCarrito)
class ItemCarritoAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

