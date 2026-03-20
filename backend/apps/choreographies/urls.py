from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CoreografiaViewSet, VideoClipViewSet

router = DefaultRouter()
router.register(r"", CoreografiaViewSet, basename="choreographies")
router.register(r"videos", VideoClipViewSet, basename="choreography-videos")

urlpatterns = [
    path("", include(router.urls)),
]

