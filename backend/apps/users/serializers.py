from rest_framework import serializers

from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones

    class Meta:
        model = CustomUser
        fields = "__all__"

