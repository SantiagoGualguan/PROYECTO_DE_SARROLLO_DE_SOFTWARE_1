from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet

router = DefaultRouter()
router.register(r'', AuthViewSet, basename='auth') #base name of the urls

urlpatterns = [
    path('', include(router.urls)),
]

