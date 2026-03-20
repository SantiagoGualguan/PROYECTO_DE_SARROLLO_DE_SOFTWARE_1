from django.contrib import admin

from .models import Coreografia, VideoClip


@admin.register(Coreografia)
class CoreografiaAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass


@admin.register(VideoClip)
class VideoClipAdmin(admin.ModelAdmin):
    # TODO: configurar list_display, search_fields, etc.
    pass

