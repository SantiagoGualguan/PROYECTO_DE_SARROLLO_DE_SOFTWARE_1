from rest_framework.views import APIView
from rest_framework.response import Response


class AdminDashboardView(APIView):
    """
    DASHBOARD:
    - GET /api/dashboard/admin/    # métricas admin/director
    """

    def get(self, request):
        raise NotImplementedError(
            "TODO: implementar métricas de dashboard para admin/director"
        )


class ProfesorDashboardView(APIView):
    """
    DASHBOARD:
    - GET /api/dashboard/profesor/ # métricas del profesor
    """

    def get(self, request):
        raise NotImplementedError(
            "TODO: implementar métricas de dashboard para profesor"
        )


class ClienteDashboardView(APIView):
    """
    DASHBOARD:
    - GET /api/dashboard/cliente/  # métricas del cliente
    """

    def get(self, request):
        raise NotImplementedError(
            "TODO: implementar métricas de dashboard para cliente"
        )

