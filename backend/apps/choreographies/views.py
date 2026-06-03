from rest_framework import viewsets,status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from apps.users.permissions import IsAdmin, IsDirector, IsProfesor
from .models import Coreography, Video
from .serializers import CoreographySerializer, VideoSerializer
from rest_framework.response import Response


class CoreographyViewSet(viewsets.ModelViewSet):
    """
    CHOREOGRAPHIES:
    - GET/POST /api/choreographies/
    - GET/PUT/DELETE /api/choreographies/<id>/
    - GET /api/choreographies/top-selling/
    # Filtros: ?genero=salsa&nivel=basico&profesor=<id>
    """
    def get_permissions(self):
        """
        Dynamically assign permissions based on the incoming action:
        - create, update, destroy: Requires Admin, Director, OR Teacher.
        - list, retrieve (GET): Just requires being a logged-in user (like Cliente).
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [(IsAdmin | IsDirector | IsProfesor)()]
        
        # all users (including Cliente) can view the list and details of choreographies
        return [AllowAny()]

    queryset = Coreography.objects.all()
    serializer_class = CoreographySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if hasattr(instance, "status"):
            instance.status = "inactive"
            instance.save(update_fields=["status"])
            return Response(status=status.HTTP_204_NO_CONTENT)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="top-selling")
    def top_selling(self, request):
        raise NotImplementedError("TODO: implementar coreografías más vendidas")


class VideoViewSet(viewsets.ModelViewSet):
    """
    - GET /api/choreographies/<id>/videos/
    - POST /api/choreographies/<id>/videos/
    """

    queryset = Video.objects.all()
    serializer_class = VideoSerializer

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

