from unittest.mock import MagicMock
from django.test import SimpleTestCase
from apps.choreographies.filters import CoreographyFilter
from apps.choreographies.models import Coreography


class CoreographyFilterTest(SimpleTestCase):
    def test_filter_fields_defined(self):
        f = CoreographyFilter()
        self.assertIn("genero", f.filters)
        self.assertIn("nivel", f.filters)
        self.assertIn("profesor", f.filters)

    def test_genero_filter_lookup(self):
        f = CoreographyFilter()
        self.assertEqual(f.filters["genero"].lookup_expr, "iexact")
        self.assertEqual(f.filters["genero"].field_name, "song_genre")

    def test_nivel_filter_lookup(self):
        f = CoreographyFilter()
        self.assertEqual(f.filters["nivel"].lookup_expr, "iexact")
        self.assertEqual(f.filters["nivel"].field_name, "dificulty_level")

    def test_profesor_filter_lookup(self):
        f = CoreographyFilter()
        self.assertEqual(f.filters["profesor"].lookup_expr, "exact")
        self.assertEqual(f.filters["profesor"].field_name, "profesor")

    def test_meta_model(self):
        self.assertEqual(CoreographyFilter._meta.model, Coreography)

    def test_meta_fields(self):
        self.assertEqual(set(CoreographyFilter._meta.fields), {"genero", "nivel", "profesor"})
