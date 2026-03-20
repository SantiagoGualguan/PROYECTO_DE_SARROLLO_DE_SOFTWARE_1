from rest_framework import viewsets
from rest_framework.decorators import action

from .models import Coreografia, VideoClip
from .serializers import CoreografiaSerializer, VideoClipSerializer


class CoreografiaViewSet(viewsets.ModelViewSet):
    """
    CHOREOGRAPHIES:
    - GET/POST /api/choreographies/
    - GET/PUT/DELETE /api/choreographies/<id>/
    - GET /api/choreographies/top-selling/
    # Filtros: ?genero=salsa&nivel=basico&profesor=<id>
    """

    queryset = Coreografia.objects.all()
    serializer_class = CoreografiaSerializer

    def list(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar listado de coreografías")

    def create(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar creación de coreografía")

    def retrieve(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar detalle de coreografía")

    def update(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar actualización de coreografía")

    def destroy(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar eliminación de coreografía")

    @action(detail=False, methods=["get"], url_path="top-selling")
    def top_selling(self, request):
        raise NotImplementedError("TODO: implementar coreografías más vendidas")


class VideoClipViewSet(viewsets.ModelViewSet):
    """
    - GET /api/choreographies/<id>/videos/
    - POST /api/choreographies/<id>/videos/
    """

    queryset = VideoClip.objects.all()
    serializer_class = VideoClipSerializer

    def list(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar listado de videoclips")

    def create(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar creación de videoclip")

    def retrieve(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar detalle de videoclip")

    def update(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar actualización de videoclip")

    def destroy(self, request, *args, **kwargs):
        raise NotImplementedError("TODO: implementar eliminación de videoclip")

