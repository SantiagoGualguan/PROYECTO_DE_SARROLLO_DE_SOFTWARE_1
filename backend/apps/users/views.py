from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import CustomUser
from .serializers import CustomUserSerializer


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticación:
    - POST /api/auth/login/
    - POST /api/auth/register/
    - POST /api/auth/logout/
    - POST /api/auth/token/refresh/
    - POST /api/auth/recover-password/
    - POST /api/auth/reset-password/<token>/
    """

    @action(detail=False, methods=["post"])
    def login(self, request):
        raise NotImplementedError("TODO: implementar login")

    @action(detail=False, methods=["post"])
    def register(self, request):
        raise NotImplementedError("TODO: implementar register")

    @action(detail=False, methods=["post"])
    def logout(self, request):
        raise NotImplementedError("TODO: implementar logout")

    @action(detail=False, methods=["post"])
    def token_refresh(self, request):
        raise NotImplementedError("TODO: implementar token refresh")

    @action(detail=False, methods=["post"])
    def recover_password(self, request):
        raise NotImplementedError("TODO: implementar recover password")

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        raise NotImplementedError("TODO: implementar reset password")


class InternalUserViewSet(viewsets.ModelViewSet):
    """
    USERS (interno):
    - GET/POST /api/users/internal/
    - GET/PUT/DELETE /api/users/internal/<id>/
    Filtros: ?rol=profesor&activo=true
    """

    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def list(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar listado de usuarios internos")

    def create(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar creación de usuario interno")

    def retrieve(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar detalle de usuario interno")

    def update(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar actualización de usuario interno")

    def destroy(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar eliminación de usuario interno")


class ClientProfileViewSet(viewsets.ViewSet):
    """
    CLIENTS:
    - GET/PUT /api/users/clients/me/
    - GET /api/users/clients/me/history/
    """

    @action(detail=False, methods=["get", "put"])
    def me(self, request):
        raise NotImplementedError("TODO: implementar perfil del cliente autenticado")

    @action(detail=False, methods=["get"], url_path="me/history")
    def history(self, request):
        raise NotImplementedError("TODO: implementar historial de compras del cliente")

