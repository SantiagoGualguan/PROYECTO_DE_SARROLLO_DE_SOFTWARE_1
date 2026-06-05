import django_filters

from .models import Coreography


class CoreographyFilter(django_filters.FilterSet):
    """
    FilterSet for Coreography.

    Supported query params (aliases used in frontend):
    - genero: filter by `song_genre` (case-insensitive exact)
    - nivel: filter by `dificulty_level` (case-insensitive exact)
    - profesor: filter by `profesor` id (exact)
    """

    genero = django_filters.CharFilter(field_name="song_genre", lookup_expr="iexact")
    nivel = django_filters.CharFilter(field_name="dificulty_level", lookup_expr="iexact")
    profesor = django_filters.NumberFilter(field_name="profesor", lookup_expr="exact")

    class Meta:
        model = Coreography
        fields = ["genero", "nivel", "profesor"]
"""
Módulo de filtros para Coreography (coreografias).

TODO: implementar filtros por género, nivel y profesor utilizando django-filter
u otra estrategia de filtrado.
"""


