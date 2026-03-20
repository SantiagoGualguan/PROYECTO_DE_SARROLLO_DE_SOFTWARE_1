from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import InternalUserViewSet, ClientProfileViewSet

router = DefaultRouter()
router.register(r'internal', InternalUserViewSet, basename='users-internal')
router.register(r'clients', ClientProfileViewSet, basename='users-clients')

urlpatterns = [
    path("", include(router.urls)),
]

