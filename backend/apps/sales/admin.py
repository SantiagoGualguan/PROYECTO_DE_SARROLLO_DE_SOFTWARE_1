from django.contrib import admin

from .models import Venta, ItemVenta, DatosFacturacion


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(ItemVenta)
class ItemVentaAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(DatosFacturacion)
class DatosFacturacionAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

