from django.contrib import admin

from .models import Coreography, Video


@admin.register(Coreography)
class CoreographyAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

