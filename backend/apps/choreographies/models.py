from django.db import models

from apps.users.models import CustomUser


class Coreografia(models.Model):
    GENERO_CHOICES = [
        ("salsa", "Salsa"),
        ("bachata", "Bachata"),
        ("merengue", "Merengue"),
        ("pop", "Pop"),
        ("hip_hop", "Hip-Hop"),
        ("reggaeton", "Reggaetón"),
        ("cumbia", "Cumbia"),
        ("otro", "Otro"),
    ]

    NIVEL_CHOICES = [
        ("basico", "Básico"),
        ("intermedio", "Intermedio"),
        ("avanzado", "Avanzado"),
    ]

    nombre_cancion = models.CharField(max_length=200)
    artista = models.CharField(max_length=200)
    genero = models.CharField(max_length=20, choices=GENERO_CHOICES)
    nivel_dificultad = models.CharField(max_length=20, choices=NIVEL_CHOICES)
    descripcion = models.TextField(blank=True)
    profesor_principal = models.ForeignKey(
        CustomUser,
        related_name="coreografias_como_principal",
        on_delete=models.PROTECT,
    )
    bailarin_invitado = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        related_name="coreografias_como_invitado",
        on_delete=models.PROTECT,
    )
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen_portada = models.ImageField(upload_to="coreografias/")
    numero_ventas = models.PositiveIntegerField(default=0)  # para ranking 'más vendidos'
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    # TODO: agregar métodos de negocio relacionados con ranking y disponibilidad


class VideoClip(models.Model):
    coreografia = models.ForeignKey(
        Coreografia, related_name="videos", on_delete=models.CASCADE
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    url_video = models.URLField()  # URL del video (YouTube embed, Vimeo, etc.)
    orden = models.PositiveIntegerField()  # orden dentro del paquete
    duracion = models.DurationField(null=True, blank=True)

    # TODO: agregar métodos auxiliares si se requieren

