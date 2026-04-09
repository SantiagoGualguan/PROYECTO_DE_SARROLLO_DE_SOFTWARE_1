from rest_framework import serializers

from .models import CustomUser

SYSTEM_ROLE_VALUES = [role for role, _ in CustomUser.ROLE_CHOICES]
INTERNAL_ALLOWED_ROLES = {"admin", "director", "profesor"}


class CustomUserSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones

    class Meta:
        model = CustomUser
        fields = "__all__"

"""guarantees that the system only recieves valid data ."""
class RegisterSerializer(serializers.Serializer):
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
        normalized_role = value.strip().lower()
        if normalized_role in {"profesor bailar\u00edn", "profesor bailarin"}:
            normalized_role = "profesor"

        if normalized_role not in SYSTEM_ROLE_VALUES:
            raise serializers.ValidationError(
                "Rol invalido. Solo se permite admin, director, profesor o client."
            )
        if normalized_role not in INTERNAL_ALLOWED_ROLES:
            raise serializers.ValidationError(
                "Para usuarios internos solo se permite Administrador, Director o Profesor bailarin."
            )

        return normalized_role

