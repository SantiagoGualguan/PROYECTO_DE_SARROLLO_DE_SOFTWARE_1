import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core import signing
from django.db import connection, transaction
from django.db.models import Q, Value
from django.db.models.functions import Concat
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend

from apps.sales.models import Purchase

from .filters import InternalUserFilter
from .models import CustomUser, UserEmail, UserPhoneNumber
from .permissions import IsAdmin
from .serializers import (
    CustomUserSerializer,
    ClientProfileUpdateSerializer,
    INTERNAL_ALLOWED_ROLES,
    InternalUserCreateSerializer,
    InternalUserListSerializer,
    InternalUserUpdateSerializer,
    RegisterSerializer,
    normalize_internal_role,
)

INTERNAL_ROLE_MESSAGES = {
    "admin": "El usuario administrador se registró con éxito.",
    "director": "El usuario director se registró con éxito.",
    "profesor": "El usuario profesor bailarín se registró con éxito.",
}

SQL_CREATION_ERROR = (
    "No se pudo crear el usuario con la funcion SQL. "
    "Verifica que 02_functions.sql este aplicado en la base de datos."
)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
PASSWORD_RESET_TOKEN_SALT = "users.password-reset"
PASSWORD_RESET_TOKEN_MAX_AGE = 60 * 60 * 24


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


def _get_primary_email(user):
    email_relation = user.emails.order_by("email_id").first()
    return email_relation.email if email_relation else None


def _get_primary_phone(user):
    phone_relation = user.phone_numbers.order_by("p_number_id").first()
    return phone_relation.p_number if phone_relation else None


def _find_user_by_identifier(identifier):
    if not identifier:
        return None

    try:
        return UserEmail.objects.select_related("user").get(email__iexact=identifier).user
    except UserEmail.DoesNotExist:
        try:
            return UserPhoneNumber.objects.select_related("user").get(p_number=identifier).user
        except UserPhoneNumber.DoesNotExist:
            return None


def _serialize_user_profile(user):
    return {
        "id": user.id,
        "nombre": f"{user.u_name} {user.last_name}".strip(),
        "correo": _get_primary_email(user),
        "identificacion": _get_primary_phone(user),
        "rol": user.u_type,
        "is_active": user.is_active,
        "validated": user.validated,
        "creation_date": user.creation_date,
    }


def _serialize_purchase_history(purchase):
    bills = list(purchase.bills.all())
    cart_items = [
        {
            "id": cart_item.cart_item_id,
            "coreography_id": cart_item.coreography_id,
            "coreography_name": cart_item.coreography.c_name,
            "unit_price": str(cart_item.unit_price),
        }
        for cart_item in purchase.cart.items.select_related("coreography").all()
    ]
    coreographies = [
        {
            "id": user_coreography.coreography_id,
            "name": user_coreography.coreography.c_name,
            "price": str(user_coreography.coreography.price),
            "genre": user_coreography.coreography.song_genre,
            "difficulty": user_coreography.coreography.dificulty_level,
        }
        for user_coreography in purchase.user_coreographies.select_related("coreography").all()
    ]

    return {
        "purchase_id": purchase.purchase_id,
        "purchase_date": purchase.purchase_date,
        "transaction_id": purchase.transaction_id,
        "cart_id": purchase.cart_id,
        "total_amount": str(bills[0].total_amount) if bills else None,
        "payment_method": bills[0].payment_method if bills else None,
        "items": cart_items,
        "coreographies": coreographies,
        "bills": [
            {
                "id": bill.bill_id,
                "total_amount": str(bill.total_amount),
                "payment_method": bill.payment_method,
                "email_address": bill.email_address,
                "titular_name": bill.titular_name,
                "document_number": bill.document_number,
                "details": bill.details,
                "creation_date": bill.creation_date,
            }
            for bill in bills
        ],
    }


def _handle_creation_error(exc):
    if isinstance(exc, ValueError):
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def verify_turnstile_token(token):
    if not token:
        return False

    secret_key = getattr(settings, "TURNSTILE_SECRET_KEY", None)
    if not secret_key:
        return False

    payload = urlencode({"secret": secret_key, "response": token}).encode("utf-8")
    request = Request(TURNSTILE_VERIFY_URL, data=payload, method="POST")
    request.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urlopen(request, timeout=5) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("success", False)
    except (URLError, TimeoutError, ValueError):
        return False


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticacion:
    - POST /api/auth/login/
    - POST /api/auth/register/
    - POST /api/auth/logout/
    - POST /api/auth/token/refresh/
    - POST /api/auth/recover-password/
    - POST /api/auth/reset-password/<token>/
    """

    queryset = CustomUser.objects.all()

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        captcha_token = (
            request.data.get("captcha_token")
            or request.data.get("turnstile_token")
            or request.data.get("captcha")
        )

        if not captcha_token:
            return Response(
                {"detail": "El token de CAPTCHA es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verify_turnstile_token(captcha_token):
            return Response(
                {"detail": "La validacion del CAPTCHA no es valida."},
                status=status.HTTP_403_FORBIDDEN,
            )

        identifier = (
            request.data.get("identifier")
            or request.data.get("email")
            or request.data.get("phone")
        )
        password = request.data.get("password")

        if not identifier or not password:
            return Response(
                {
                    "detail": "los identificadores (correo o telefono) y la contrasena son requeridos"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.authenticate_by_identifier(identifier, password)
        if not user:
            return Response(
                {"detail": "Credenciales invalidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "El usuario esta inactivo"},
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
        refresh_token = (
            request.data.get("refresh")
            or request.data.get("refresh_token")
            or request.data.get("token")
        )

        if refresh_token:
            try:
                RefreshToken(refresh_token)
            except TokenError:
                return Response(
                    {"detail": "El token de refresco no es valido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {
                "detail": (
                    "La sesion se cerro correctamente. El cliente debe eliminar "
                    "sus tokens locales."
                )
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="token-refresh")
    def token_refresh(self, request):
        refresh_token = request.data.get("refresh") or request.data.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "El refresh token es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)
            user = CustomUser.objects.filter(id=refresh["user_id"]).first()
        except TokenError:
            return Response(
                {"detail": "El refresh token no es valido."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user:
            return Response(
                {"detail": "El usuario asociado al token no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_active:
            return Response(
                {"detail": "El usuario esta inactivo."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _build_auth_response(user, status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="recover-password")
    def recover_password(self, request):
        identifier = (
            request.data.get("identifier")
            or request.data.get("email")
            or request.data.get("phone")
        )

        if not identifier:
            return Response(
                {"detail": "El correo o telefono es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        captcha_token = (
            request.data.get("captcha_token")
            or request.data.get("turnstile_token")
            or request.data.get("captcha")
        )
        if not captcha_token:
            return Response(
                {"detail": "El token de CAPTCHA es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verify_turnstile_token(captcha_token):
            return Response(
                {"detail": "La validacion del CAPTCHA no es valida."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = _find_user_by_identifier(identifier)
        if not user:
            return Response(
                {"detail": "No se encontro un usuario con ese identificador."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_active:
            return Response(
                {"detail": "El usuario esta inactivo."},
                status=status.HTTP_403_FORBIDDEN,
            )

        reset_token = signing.dumps({"user_id": user.id}, salt=PASSWORD_RESET_TOKEN_SALT)

        return Response(
            {
                "detail": "Se genero un token de recuperacion de contrasena.",
                "user_id": user.id,
                "reset_token": reset_token,
                "reset_url": f"/api/auth/reset-password/{reset_token}/",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path=r"reset-password/(?P<token>[^/.]+)")
    def reset_password(self, request, token=None):
        new_password = request.data.get("new_password") or request.data.get("password")
        confirm_password = request.data.get("confirm_password") or request.data.get(
            "password_confirm"
        )

        if not new_password:
            return Response(
                {"detail": "La nueva contrasena es requerida."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if confirm_password is not None and confirm_password != new_password:
            return Response(
                {"detail": "Las contrasenas no coinciden."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        captcha_token = (
            request.data.get("captcha_token")
            or request.data.get("turnstile_token")
            or request.data.get("captcha")
        )
        if not captcha_token:
            return Response(
                {"detail": "El token de CAPTCHA es requerido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not verify_turnstile_token(captcha_token):
            return Response(
                {"detail": "La validacion del CAPTCHA no es valida."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            payload = signing.loads(
                token,
                salt=PASSWORD_RESET_TOKEN_SALT,
                max_age=PASSWORD_RESET_TOKEN_MAX_AGE,
            )
        except signing.SignatureExpired:
            return Response(
                {"detail": "El token de recuperacion expiro."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except signing.BadSignature:
            return Response(
                {"detail": "El token de recuperacion no es valido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.filter(id=payload.get("user_id")).first()
        if not user:
            return Response(
                {"detail": "El usuario no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_active:
            return Response(
                {"detail": "El usuario esta inactivo."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.password = make_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "La contrasena fue actualizada con exito."},
            status=status.HTTP_200_OK,
        )


class InternalUserViewSet(viewsets.ModelViewSet):
    """
    USERS (interno):
    - GET/POST /api/users/internal/
    - GET/PUT/DELETE /api/users/internal/<id>/
    """

    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_class = InternalUserFilter

    def get_queryset(self):
        return (
            CustomUser.objects.filter(u_type__in=INTERNAL_ALLOWED_ROLES)
            .prefetch_related("emails", "phone_numbers")
            .order_by("id")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return InternalUserListSerializer
        if self.action == "create":
            return InternalUserCreateSerializer
        if self.action in {"update", "partial_update"}:
            return InternalUserUpdateSerializer
        return CustomUserSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        search_value = request.query_params.get("search")
        if search_value is not None:
            cleaned_search = search_value.strip()
            if cleaned_search:
                queryset = (
                    queryset.annotate(full_name=Concat("u_name", Value(" "), "last_name"))
                    .filter(
                        Q(full_name__icontains=cleaned_search)
                        | Q(u_name__icontains=cleaned_search)
                        | Q(last_name__icontains=cleaned_search)
                        | Q(phone_numbers__p_number__icontains=cleaned_search)
                    )
                    .distinct()
                )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

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
        user_id = kwargs.get("pk")
        user = (
            CustomUser.objects.filter(id=user_id)
            .prefetch_related("emails", "phone_numbers")
            .first()
        )

        if not user:
            return Response(
                {"detail": "El usuario no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.u_type not in INTERNAL_ALLOWED_ROLES:
            return Response(
                {"detail": "Solo se pueden consultar usuarios internos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = InternalUserListSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        user_id = kwargs.get("pk")
        partial = kwargs.pop("partial", False)

        user = (
            CustomUser.objects.filter(id=user_id)
            .prefetch_related("emails", "phone_numbers")
            .first()
        )
        if not user:
            return Response(
                {"detail": "El usuario no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.u_type not in INTERNAL_ALLOWED_ROLES:
            return Response(
                {
                    "detail": (
                        "Solo se pueden actualizar usuarios internos "
                        "(admin, director, profesor)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data=request.data,
            context={"user": user},
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user_fields_to_update = []
        if "nombre" in data:
            first_name, last_name = _split_full_name(data["nombre"])
            user.u_name = first_name
            user.last_name = last_name
            user_fields_to_update.extend(["u_name", "last_name"])

        if "rol" in data:
            user.u_type = data["rol"]
            user_fields_to_update.append("u_type")

        if "contrasena" in data:
            user.password = make_password(data["contrasena"])
            user_fields_to_update.append("password")

        if "is_active" in data:
            user.is_active = data["is_active"]
            user_fields_to_update.append("is_active")

        if "validated" in data:
            user.validated = data["validated"]
            user_fields_to_update.append("validated")

        with transaction.atomic():
            if user_fields_to_update:
                user.save(update_fields=list(set(user_fields_to_update)))

            if "correo" in data:
                email_relation = user.emails.order_by("email_id").first()
                if email_relation:
                    email_relation.email = data["correo"]
                    email_relation.save(update_fields=["email"])
                else:
                    UserEmail.objects.create(user=user, email=data["correo"])

            if "identificacion" in data:
                phone_relation = user.phone_numbers.order_by("p_number_id").first()
                if phone_relation:
                    phone_relation.p_number = data["identificacion"]
                    phone_relation.save(update_fields=["p_number"])
                else:
                    UserPhoneNumber.objects.create(
                        user=user,
                        p_number=data["identificacion"],
                    )

        updated_user = (
            CustomUser.objects.filter(id=user.id)
            .prefetch_related("emails", "phone_numbers")
            .first()
        )
        response_user = InternalUserListSerializer(updated_user).data

        return Response(
            {
                "detail": "Los datos del usuario fueron actualizados con éxito.",
                "user": response_user,
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        user_id = kwargs.get("pk")
        user = CustomUser.objects.filter(pk=user_id).first()

        if not user:
            return Response(
                {"detail": "El usuario interno no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.u_type not in INTERNAL_ALLOWED_ROLES:
            return Response(
                {"detail": "Solo se pueden eliminar usuarios internos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "El usuario ya estaba eliminado o inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user.delete()  # soft delete: marca is_active=False

        return Response(
            {"detail": "El usuario fue eliminado con éxito."},
            status=status.HTTP_200_OK,
        )


class ClientProfileViewSet(viewsets.ViewSet):
    """
    CLIENTS:
    - GET/PUT /api/users/clients/me/
    - GET /api/users/clients/me/history/
    """

    @action(detail=False, methods=["get", "put"])
    def me(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Se requiere autenticacion."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if getattr(user, "u_type", None) != "client":
            return Response(
                {"detail": "Solo el cliente autenticado puede acceder a este recurso."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = (
            CustomUser.objects.filter(id=user.id)
            .prefetch_related("emails", "phone_numbers")
            .first()
        )

        if request.method == "GET":
            return Response(_serialize_user_profile(user), status=status.HTTP_200_OK)

        serializer = ClientProfileUpdateSerializer(
            data=request.data,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user_fields_to_update = []
        if "nombre" in data:
            first_name, last_name = _split_full_name(data["nombre"])
            user.u_name = first_name
            user.last_name = last_name
            user_fields_to_update.extend(["u_name", "last_name"])

        if "contrasena" in data:
            user.password = make_password(data["contrasena"])
            user_fields_to_update.append("password")

        with transaction.atomic():
            if user_fields_to_update:
                user.save(update_fields=list(set(user_fields_to_update)))

            if "correo" in data:
                email_relation = user.emails.order_by("email_id").first()
                if email_relation:
                    email_relation.email = data["correo"]
                    email_relation.save(update_fields=["email"])
                else:
                    UserEmail.objects.create(user=user, email=data["correo"])

            if "identificacion" in data:
                phone_relation = user.phone_numbers.order_by("p_number_id").first()
                if phone_relation:
                    phone_relation.p_number = data["identificacion"]
                    phone_relation.save(update_fields=["p_number"])
                else:
                    UserPhoneNumber.objects.create(
                        user=user,
                        p_number=data["identificacion"],
                    )

        updated_user = (
            CustomUser.objects.filter(id=user.id)
            .prefetch_related("emails", "phone_numbers")
            .first()
        )

        return Response(
            {
                "detail": "Los datos del cliente fueron actualizados con exito.",
                "user": _serialize_user_profile(updated_user),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="me/history")
    def history(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Se requiere autenticacion."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if getattr(user, "u_type", None) != "client":
            return Response(
                {"detail": "Solo el cliente autenticado puede acceder a este recurso."},
                status=status.HTTP_403_FORBIDDEN,
            )

        purchases = (
            Purchase.objects.filter(cart__user=user)
            .select_related("cart")
            .prefetch_related(
                "bills",
                "user_coreographies__coreography",
                "cart__items__coreography",
            )
            .order_by("-purchase_date", "-purchase_id")
        )

        serialized_purchases = [_serialize_purchase_history(purchase) for purchase in purchases]

        return Response(
            {
                "count": len(serialized_purchases),
                "results": serialized_purchases,
            },
            status=status.HTTP_200_OK,
        )
