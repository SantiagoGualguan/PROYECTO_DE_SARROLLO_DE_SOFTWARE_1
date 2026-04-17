from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PurchaseViewSet

router = DefaultRouter()
router.register(r"", PurchaseViewSet, basename="sales") #base name 'sales' for the urls

urlpatterns = [
    path("", include(router.urls)),
]

