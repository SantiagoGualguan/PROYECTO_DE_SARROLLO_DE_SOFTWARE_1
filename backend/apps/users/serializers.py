from rest_framework import serializers

from .models import CustomUser


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
        choices=["admin", "director", "profesor", "client"],
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

