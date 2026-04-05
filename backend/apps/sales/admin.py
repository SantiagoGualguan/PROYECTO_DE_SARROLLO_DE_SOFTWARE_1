from django.contrib import admin

from .models import Bill, Purchase, UserCoreography


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(UserCoreography)
class UserCoreographyAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

