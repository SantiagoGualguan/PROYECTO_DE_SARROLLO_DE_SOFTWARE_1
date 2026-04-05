from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    """Manager with helper to authenticate by email or phone against unmanaged tables."""

    def get_by_natural_key(self, username):
        return self.get(pk=username)

    def authenticate_by_identifier(self, identifier, password):
        """Lookup user by email or phone and verify hashed password.

        Returns the user instance if credentials are valid, otherwise None.
        """
        user = None
        # Try email lookup
        try:
            email_rel = UserEmail.objects.select_related("user").get(email__iexact=identifier)
            user = email_rel.user
        except UserEmail.DoesNotExist:
            # Try phone lookup
            try:
                phone_rel = UserPhoneNumber.objects.select_related("user").get(p_number=identifier)
                user = phone_rel.user
            except UserPhoneNumber.DoesNotExist:
                return None

        if user and user.check_password(password):
            return user
        return None


class CustomUser(AbstractBaseUser):
    ROLE_CHOICES = [
        ("admin", "administrador"),
        ("director", "director"),
        ("profesor", "profesor bailarin"),
        ("client", "cliente"),
    ]

    id = models.AutoField(primary_key=True)
    u_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255, db_column="u_password")
    creation_date = models.DateTimeField(db_column="creation_date", null=True, blank=True)
    u_type = models.CharField(max_length=25, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    validated = models.BooleanField(default=False)
    

    USERNAME_FIELD = "id"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()
    def delete(self, *args, **kwargs):
        # never actually delete, just deactivate
        self.is_active = False
        self.save()

    class Meta:
        managed = False
        db_table = "users"

    def __str__(self):
        return f"{self.u_name} {self.last_name} ({self.u_type})"

    @property
    def first_name(self):
        return self.u_name

    @property
    def last_name_display(self):
        return self.last_name

    @property
    def is_staff(self):
        # Treat admin/director as staff for admin-site compatibility without adding DB columns.
        return self.u_type in {"admin", "director"}


class UserEmail(models.Model):
    email_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        CustomUser,
        db_column="u_id",
        related_name="emails",
        on_delete=models.DO_NOTHING,
    )
    email = models.EmailField(unique=True)

    class Meta:
        managed = False
        db_table = "user_email"

    def __str__(self):
        return self.email


class UserPhoneNumber(models.Model):
    p_number_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        CustomUser,
        db_column="u_id",
        related_name="phone_numbers",
        on_delete=models.DO_NOTHING,
    )
    p_number = models.CharField(max_length=15, unique=True)

    class Meta:
        managed = False
        db_table = "user_phone_number"

    def __str__(self):
        return self.p_number


class Profesor(models.Model):
    user = models.OneToOneField(
        CustomUser,
        db_column="id",
        primary_key=True,
        related_name="profesor_profile",
        on_delete=models.DO_NOTHING,
    )
    biography = models.CharField(max_length=300, blank=True, null=True)
    years_of_experience = models.IntegerField()
    billing_information = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "profesor"

    def __str__(self):
        return f"Profesor {self.user.u_name} {self.user.last_name}"

