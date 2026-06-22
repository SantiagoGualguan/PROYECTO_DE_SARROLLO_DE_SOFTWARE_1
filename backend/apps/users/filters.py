import django_filters
from rest_framework.exceptions import ValidationError

from .models import CustomUser
from .serializers import INTERNAL_ALLOWED_ROLES, normalize_internal_role


class InternalUserFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name="id", lookup_expr="exact")
    rol = django_filters.CharFilter(method="filter_rol")

    class Meta:
        model = CustomUser
        fields = ["id", "rol"]

    def filter_rol(self, queryset, name, value):
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValidationError({"rol": "El parametro rol no puede estar vacio."})

        canonical_role = normalize_internal_role(cleaned_value)
        if canonical_role not in INTERNAL_ALLOWED_ROLES:
            raise ValidationError(
                {
                    "rol": (
                        "Rol invalido. Usa admin, director o profesor "
                        "(profesor bailarin tambien es valido)."
                    )
                }
            )

        return queryset.filter(u_type=canonical_role)