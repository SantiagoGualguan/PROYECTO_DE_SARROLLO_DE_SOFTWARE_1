from django.contrib.auth.hashers import make_password
from django.db import connection, transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, UserEmail, UserPhoneNumber
from .permissions import IsAdmin
from .serializers import (
    CustomUserSerializer,
    InternalUserCreateSerializer,
    RegisterSerializer,
)

INTERNAL_ROLE_MESSAGES = {
    "admin": "El usuario administrador se registr\u00f3 con \u00e9xito.",
    "director": "El usuario director se registr\u00f3 con \u00e9xito.",
    "profesor": "El usuario profesor bailar\u00edn se registr\u00f3 con \u00e9xito.",
}
SQL_CREATION_ERROR = (
    "No se pudo crear el usuario con la funcion SQL. "
    "Verifica que 02_functions.sql este aplicado en la base de datos."
)


def _split_full_name(full_name):
    tokens = [token for token in full_name.split(" ") if token]
    if not tokens:
        return "", ""
    if len(tokens) == 1:
        return tokens[0], "."
    return tokens[0], " ".join(tokens[1:])


def _create_user_with_sql(
    *,
    first_name,
    last_name,
    password,
    email,
    phone_or_id,
    role,
    duplicate_identifier_message,
    biography="",
    years_of_experience=0,
    billing_information="",
):
    if UserEmail.objects.filter(email__iexact=email).exists():
        raise ValueError("El correo ya esta registrado.")

    if UserPhoneNumber.objects.filter(p_number=phone_or_id).exists():
        raise ValueError(duplicate_identifier_message)

    hashed_password = make_password(password)

    with transaction.atomic():
        with connection.cursor() as cursor:
            if role == "profesor":
                cursor.execute(
                    "SELECT create_profesor(%s, %s, %s, %s, %s, %s, %s, %s)",
                    [
                        first_name,
                        last_name,
                        hashed_password,
                        email,
                        phone_or_id,
                        biography or "",
                        years_of_experience,
                        billing_information or "",
                    ],
                )
            else:
                cursor.execute(
                    "SELECT create_user(%s, %s, %s, %s, %s, %s)",
                    [
                        first_name,
                        last_name,
                        hashed_password,
                        role,
                        email,
                        phone_or_id,
                    ],
                )

    user = CustomUser.objects.filter(emails__email__iexact=email).order_by("-id").first()
    if not user:
        raise RuntimeError(SQL_CREATION_ERROR)

    return user


def _build_auth_response(user, response_status):
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
        status=response_status,
    )


def _handle_creation_error(exc):
    if isinstance(exc, ValueError):
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticaci\u00f3n:
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
                {
                    "detail": "los identificadores (correo o telefono) y la contrase\u00f1a son requeridos"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.authenticate_by_identifier(identifier, password)
        if not user:
            return Response(
                {"detail": "Credenciales inv\u00e1lidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "El usuario est\u00e1 inactivo"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _build_auth_response(user, status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        email = data["email"].lower()
        phone = data["phone"]
        role = data.get("role", "client")
        try:
            user = _create_user_with_sql(
                first_name=data["first_name"],
                last_name=data["last_name"],
                password=data["password"],
                email=email,
                phone_or_id=phone,
                role=role,
                duplicate_identifier_message="El telefono ya esta registrado.",
                biography=data.get("biography"),
                years_of_experience=data.get("years_of_experience", 0),
                billing_information=data.get("billing_information"),
            )
        except (ValueError, RuntimeError) as exc:
            return _handle_creation_error(exc)

        return _build_auth_response(user, status.HTTP_201_CREATED)

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
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return InternalUserCreateSerializer
        return CustomUserSerializer

    def list(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar listado de usuarios internos")

    def create(self, request, *args, **kwargs):
        serializer = InternalUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        nombre = data["nombre"]
        identificacion = data["identificacion"]
        correo = data["correo"].lower()
        rol = data["rol"]
        contrasena = data["contrasena"]

        first_name, last_name = _split_full_name(nombre)
        try:
            user = _create_user_with_sql(
                first_name=first_name,
                last_name=last_name,
                password=contrasena,
                email=correo,
                phone_or_id=identificacion,
                role=rol,
                duplicate_identifier_message="La identificacion ya esta registrada.",
                biography="",
                years_of_experience=0,
                billing_information="",
            )
        except (ValueError, RuntimeError) as exc:
            return _handle_creation_error(exc)

        return Response(
            {
                "detail": INTERNAL_ROLE_MESSAGES[rol],
                "user": {
                    "id": user.id,
                    "nombre": f"{user.u_name} {user.last_name}".strip(),
                    "correo": correo,
                    "rol": user.u_type,
                    "identificacion": identificacion,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar detalle de usuario interno")

    def update(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar actualizaci\u00f3n de usuario interno")

    def destroy(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar eliminaci\u00f3n de usuario interno")


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
