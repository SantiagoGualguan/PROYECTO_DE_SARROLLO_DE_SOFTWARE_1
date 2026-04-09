from rest_framework import serializers

from .models import CustomUser, UserEmail, UserPhoneNumber

SYSTEM_ROLE_VALUES = [role for role, _ in CustomUser.ROLE_CHOICES]
INTERNAL_ALLOWED_ROLES = {"admin", "director", "profesor"}


def normalize_internal_role(role_value):
    normalized_role = role_value.strip().lower()

    if normalized_role == "administrador":
        return "admin"
    if normalized_role in {"profesor bailarín", "profesor bailarin"}:
        return "profesor"

    return normalized_role


class CustomUserSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones

    class Meta:
        model = CustomUser
        fields = "__all__"


class RegisterSerializer(serializers.Serializer):
    """Validates public register payload."""

    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=SYSTEM_ROLE_VALUES,
        default="client",
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    biography = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    years_of_experience = serializers.IntegerField(required=False, min_value=0)
    billing_information = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=100,
    )

    def validate(self, attrs):
        role = attrs.get("role", "client")
        if role == "profesor" and "years_of_experience" not in attrs:
            raise serializers.ValidationError(
                {"years_of_experience": "This field is required when role is profesor."}
            )
        return attrs


class InternalUserCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    identificacion = serializers.CharField(max_length=15)
    correo = serializers.EmailField()
    rol = serializers.CharField(max_length=30)
    contrasena = serializers.CharField(write_only=True, min_length=8)

    def validate_nombre(self, value):
        cleaned_value = value.strip()
        if not cleaned_value:
            raise serializers.ValidationError("El nombre es obligatorio.")
        return cleaned_value

    def validate_identificacion(self, value):
        cleaned_value = value.strip()
        if not cleaned_value:
            raise serializers.ValidationError("La identificacion es obligatoria.")
        if len(cleaned_value) > 15:
            raise serializers.ValidationError(
                "La identificacion no puede superar 15 caracteres."
            )
        return cleaned_value

    def validate_rol(self, value):
        normalized_role = normalize_internal_role(value)

        if normalized_role not in SYSTEM_ROLE_VALUES:
            raise serializers.ValidationError(
                "Rol invalido. Solo se permite admin, director, profesor o client."
            )
        if normalized_role not in INTERNAL_ALLOWED_ROLES:
            raise serializers.ValidationError(
                "Para usuarios internos solo se permite Administrador, Director o Profesor bailarin."
            )

        return normalized_role


class InternalUserListSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()
    correo = serializers.SerializerMethodField()
    identificacion = serializers.SerializerMethodField()
    rol = serializers.CharField(source="u_type")

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "nombre",
            "correo",
            "identificacion",
            "rol",
            "is_active",
            "validated",
            "creation_date",
        ]

    def get_nombre(self, obj):
        return f"{obj.u_name} {obj.last_name}".strip()

    def get_correo(self, obj):
        first_email = next(iter(obj.emails.all()), None)
        return first_email.email if first_email else None

    def get_identificacion(self, obj):
        first_phone = next(iter(obj.phone_numbers.all()), None)
        return first_phone.p_number if first_phone else None


class InternalUserUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100, required=False)
    identificacion = serializers.CharField(max_length=15, required=False)
    correo = serializers.EmailField(required=False)
    rol = serializers.CharField(max_length=30, required=False)
    contrasena = serializers.CharField(write_only=True, min_length=8, required=False)
    is_active = serializers.BooleanField(required=False)
    validated = serializers.BooleanField(required=False)

    def validate_nombre(self, value):
        cleaned_value = value.strip()
        if not cleaned_value:
            raise serializers.ValidationError("El nombre es obligatorio.")
        return cleaned_value

    def validate_identificacion(self, value):
        cleaned_value = value.strip()
        if not cleaned_value:
            raise serializers.ValidationError("La identificacion es obligatoria.")
        if len(cleaned_value) > 15:
            raise serializers.ValidationError(
                "La identificacion no puede superar 15 caracteres."
            )
        return cleaned_value

    def validate_correo(self, value):
        return value.strip().lower()

    def validate_rol(self, value):
        normalized_role = normalize_internal_role(value)
        if normalized_role not in INTERNAL_ALLOWED_ROLES:
            raise serializers.ValidationError(
                "Rol invalido. Solo se permite admin, director o profesor bailarin."
            )
        return normalized_role

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                {"detail": "Debe enviar al menos un campo valido para actualizar."}
            )

        user = self.context.get("user")
        correo = attrs.get("correo")
        if correo:
            existing_email = UserEmail.objects.filter(email__iexact=correo)
            if user is not None:
                existing_email = existing_email.exclude(user=user)
            if existing_email.exists():
                raise serializers.ValidationError(
                    {"correo": "El correo ya esta registrado."}
                )

        identificacion = attrs.get("identificacion")
        if identificacion:
            existing_phone = UserPhoneNumber.objects.filter(p_number=identificacion)
            if user is not None:
                existing_phone = existing_phone.exclude(user=user)
            if existing_phone.exists():
                raise serializers.ValidationError(
                    {"identificacion": "La identificacion ya esta registrada."}
                )

        return attrs
