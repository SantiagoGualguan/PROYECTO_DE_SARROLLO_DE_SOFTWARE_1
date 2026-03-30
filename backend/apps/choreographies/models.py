from django.db import models

from apps.users.models import Profesor


class Coreography(models.Model):
    DIFFICULTY_CHOICES = [
        ("basic", "basico"),
        ("intermediate", "intermedio"),
        ("advanced", "avanzado"),
    ]

    coreography_id = models.AutoField(primary_key=True)
    c_name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=255, blank=True, null=True)
    c_description = models.CharField(max_length=500, blank=True, null=True)
    dificulty_level = models.CharField(max_length=30, choices=DIFFICULTY_CHOICES)
    song_name = models.CharField(max_length=100, blank=True, null=True)
    song_genre = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    times_sold = models.IntegerField(default=0)
    profesor = models.ForeignKey(
        Profesor,
        db_column="profesor_id",
        related_name="coreographies_as_main",
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
    )
    assistent_profesor = models.ForeignKey(
        Profesor,
        db_column="assistent_profesor_id",
        related_name="coreographies_as_assistant",
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=20, default="active")
    creation_date = models.DateTimeField(db_column="creation_date", null=True, blank=True)

    class Meta:
        managed = False
        db_table = "coreography"

    def __str__(self):
        return self.c_name


class Video(models.Model):
    video_id = models.AutoField(primary_key=True)
    video_name = models.CharField(max_length=100)
    video_url = models.CharField(max_length=255)
    coreography = models.ForeignKey(
        Coreography,
        db_column="coreography_id",
        related_name="videos",
        on_delete=models.DO_NOTHING,
    )
    upload_date = models.DateTimeField(db_column="upload_date", null=True, blank=True)

    class Meta:
        managed = False
        db_table = "video"

    def __str__(self):
        return self.video_name

