from django.utils import timezone
from rest_framework import serializers

from .models import Coreography, Video


class VideoSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de Video

    class Meta:
        model = Video
        fields = "__all__"
        read_only_fields = ["upload_date"]

    def create(self, validated_data):
        validated_data.setdefault("upload_date", timezone.now())
        return super().create(validated_data)


class CoreographySerializer(serializers.ModelSerializer):
    # TODO: incluir relación con videos si es necesario

    class Meta:
        model = Coreography
        fields = "__all__"
        # excludes = ["creation_date"]  # so we can set it automatically in create()
        read_only_fields = ["creation_date"]

    def create(self, validated_data):
        validated_data.setdefault("creation_date", timezone.now())
        return super().create(validated_data)

