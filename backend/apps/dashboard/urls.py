from django.urls import path

from .views import AdminDashboardView, ProfesorDashboardView, ClienteDashboardView

urlpatterns = [
    path("admin/", AdminDashboardView.as_view(), name="dashboard-admin"),
    path("profesor/", ProfesorDashboardView.as_view(), name="dashboard-profesor"),
    path("cliente/", ClienteDashboardView.as_view(), name="dashboard-cliente"),
]

