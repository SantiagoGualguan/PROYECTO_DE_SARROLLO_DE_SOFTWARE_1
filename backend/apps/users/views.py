from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.db import connection, transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
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

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="recover-password")
    def recover_password(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "El correo electrónico es requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            email_rel = UserEmail.objects.select_related("user").get(email__iexact=email)
            user = email_rel.user
        except UserEmail.DoesNotExist:
            return Response(
                {"detail": "Se ha enviado un enlace para recuperar tu contraseña"},
                status=status.HTTP_200_OK,
            )

        if not user.is_active:
            return Response(
                {"detail": "Se ha enviado un enlace para recuperar tu contraseña"},
                status=status.HTTP_200_OK,
            )

        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        return Response(
            {"detail": "Se ha enviado un enlace para recuperar tu contraseña"},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], permission_classes=[AllowAny], url_path="reset-password")
    def reset_password(self, request):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")
        new_password = request.data.get("password")

        if not uidb64 or not token or not new_password:
            return Response(
                {"detail": "uidb64, token y password son requeridos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {"detail": "El enlace de recuperación es inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "El enlace de recuperación es inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response(
                {"detail": "El enlace de recuperación es inválido o ha expirado"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.password = make_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Contraseña actualizada exitosamente"},
            status=status.HTTP_200_OK,
        )


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

