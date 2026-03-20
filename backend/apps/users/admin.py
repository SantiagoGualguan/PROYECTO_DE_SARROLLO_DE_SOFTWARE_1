from django.contrib import admin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

