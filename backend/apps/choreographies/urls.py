from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CoreographyViewSet, VideoViewSet

choreography_router = DefaultRouter()
choreography_router.register(r"(?P<cid>[0-9]+)", CoreographyViewSet, basename="choreographies")

video_router = DefaultRouter()
video_router.register(r"", VideoViewSet, basename="videos")

urlpatterns = [
    path("", include(choreography_router.urls)),
    path("videos/", include(video_router.urls)),
]