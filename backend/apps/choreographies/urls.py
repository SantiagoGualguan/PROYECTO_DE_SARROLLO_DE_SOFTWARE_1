from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CoreographyViewSet, VideoViewSet

router = DefaultRouter()
router.register(r"", CoreographyViewSet, basename="choreographies")
router.register(r"videos", VideoViewSet, basename="choreography-videos")

urlpatterns = [
    path("", include(router.urls)),
]

