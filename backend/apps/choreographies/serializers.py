from rest_framework import serializers

from .models import Coreografia, VideoClip


class VideoClipSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de VideoClip

    class Meta:
        model = VideoClip
        fields = "__all__"


class CoreografiaSerializer(serializers.ModelSerializer):
    # TODO: incluir relación con videos si es necesario

    class Meta:
        model = Coreografia
        fields = "__all__"

