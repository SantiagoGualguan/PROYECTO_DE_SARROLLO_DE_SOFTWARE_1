from django.contrib.auth.hashers import make_password
from django.db import connection, transaction
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, UserEmail, UserPhoneNumber
from .serializers import CustomUserSerializer, RegisterSerializer


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
    """
    each action uses the base name 'auth' for the urls
    and adds the specific action name to the url, for example:       
    - POST /api/auth/login/ -> calls the login method
    auth = base and login = action name, so the url is /api/auth/login/
     this allows us to have a clean and organized url structure for authentication related actions.
    """

    queryset = CustomUser.objects.all()
    #login method
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        identifier = (
            request.data.get("identifier")
            or request.data.get("email")
            or request.data.get("phone")
        )
        password = request.data.get("password")

        if not identifier or not password:
            return Response(
                {"detail": "los identificadores (correo o telefono) y la contraseña son requeridos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.authenticate_by_identifier(identifier, password)
        if not user:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "El usuario está inactivo"},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "first_name": user.u_name,
                    "last_name": user.last_name,
                    "role": user.u_type,
                },
            },
            status=status.HTTP_200_OK,
        )

    #register method
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        email = data["email"].lower()
        phone = data["phone"]
        role = data.get("role", "client")

        if UserEmail.objects.filter(email__iexact=email).exists():
            return Response(
                {"detail": "El correo ya está registrado"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if UserPhoneNumber.objects.filter(p_number=phone).exists():
            return Response(
                {"detail": "El teléfono ya está registrado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hashed_password = make_password(data["password"])

        with transaction.atomic():
            with connection.cursor() as cursor:
                if role == "profesor":
                    cursor.execute(
                        "SELECT create_profesor(%s, %s, %s, %s, %s, %s, %s, %s)",
                        [
                            data["first_name"],
                            data["last_name"],
                            hashed_password,
                            email,
                            phone,
                            data.get("biography") or "",
                            data["years_of_experience"],
                            data.get("billing_information") or "",
                        ],
                    )
                else:
                    cursor.execute(
                        "SELECT create_user(%s, %s, %s, %s, %s, %s)",
                        [
                            data["first_name"],
                            data["last_name"],
                            hashed_password,
                            role,
                            email,
                            phone,
                        ],
                    )

        user = (
            CustomUser.objects.filter(emails__email__iexact=email)
            .order_by("-id")
            .first()
        )
        if not user:
            return Response(
                {
                    "detail": "No se pudo crear el usuario con la función SQL. "
                    "Verifica que 02_functions.sql esté aplicado en la base de datos."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "first_name": user.u_name,
                    "last_name": user.last_name,
                    "role": user.u_type,
                },
            },
            status=status.HTTP_201_CREATED,
        )
        
        

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

