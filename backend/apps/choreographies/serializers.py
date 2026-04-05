from rest_framework import serializers

from .models import Coreography, Video


class VideoSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de Video

    class Meta:
        model = Video
        fields = "__all__"


class CoreographySerializer(serializers.ModelSerializer):
    # TODO: incluir relación con videos si es necesario

    class Meta:
        model = Coreography
        fields = "__all__"

