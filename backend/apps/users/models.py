from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class CustomUserManager(BaseUserManager):
    # TODO: implementar create_user y create_superuser completos
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'admin')
        extra_fields.setdefault('nombre', 'Admin')
        extra_fields.setdefault('apellido', 'Admin')
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('director', 'Director'),
        ('profesor', 'Profesor Bailarín'),
        ('cliente', 'Cliente'),
    ]
    GENERO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]

    email            = models.EmailField(unique=True)
    username         = models.CharField(max_length=50, unique=True)
    nombre           = models.CharField(max_length=100)
    apellido         = models.CharField(max_length=100)
    rol              = models.CharField(max_length=20, choices=ROL_CHOICES)
    telefono         = models.CharField(max_length=20, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero           = models.CharField(max_length=1, choices=GENERO_CHOICES, blank=True)
    foto_perfil      = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    especialidad     = models.CharField(max_length=100, blank=True)
    is_active        = models.BooleanField(default=True)
    is_staff         = models.BooleanField(default=False)
    fecha_registro   = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username', 'nombre', 'apellido', 'rol']

    objects = CustomUserManager()

    def __str__(self):
        return f'{self.nombre} {self.apellido} ({self.rol})'

