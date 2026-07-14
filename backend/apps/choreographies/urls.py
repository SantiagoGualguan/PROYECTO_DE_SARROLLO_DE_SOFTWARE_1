from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CoreographyViewSet, VideoViewSet

choreography_router = DefaultRouter()
choreography_router.register(r"", CoreographyViewSet, basename="choreographies")

urlpatterns = [
    path(
        "videos/",
        VideoViewSet.as_view({"get": "list", "post": "create"}),
        name="video-list",
    ),
    path(
        "videos/<int:pk>/",
        VideoViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="video-detail",
    ),
    path("", include(choreography_router.urls)),
]