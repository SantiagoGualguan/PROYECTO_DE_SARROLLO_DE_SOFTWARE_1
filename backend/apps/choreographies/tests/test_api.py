from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase
from django.http import Http404
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.choreographies.views import CoreographyViewSet, VideoViewSet

factory = APIRequestFactory()


def _make_user(u_type="client", user_id=1, is_active=True):
    user = MagicMock()
    user.id = user_id
    user.pk = user_id
    user.u_type = u_type
    user.is_active = is_active
    user.is_authenticated = True
    return user


def _make_coreography(**kwargs):
    c = MagicMock()
    c.coreography_id = kwargs.get("coreography_id", 1)
    c.c_name = kwargs.get("c_name", "Test Dance")
    c.c_description = kwargs.get("c_description", "")
    c.dificulty_level = kwargs.get("dificulty_level", "basic")
    c.song_name = kwargs.get("song_name", "")
    c.song_genre = kwargs.get("song_genre", "")
    c.price = kwargs.get("price", "10000.00")
    c.times_sold = kwargs.get("times_sold", 0)
    c.status = kwargs.get("status", "active")
    c.image_url = kwargs.get("image_url", None)
    c.profesor = kwargs.get("profesor", None)
    c.assistent_profesor = kwargs.get("assistent_profesor", None)
    c.creation_date = kwargs.get("creation_date", None)
    return c


# ---------------------------------------------------------------------------
# CoreographyViewSet
# ---------------------------------------------------------------------------

class CoreographyListTest(SimpleTestCase):
    @patch.object(CoreographyViewSet, 'filter_queryset')
    def test_list_returns_all(self, mock_filter):
        c = _make_coreography()
        mock_filter.return_value = [c]

        req = factory.get("/api/choreographies/")
        view = CoreographyViewSet.as_view({"get": "list"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)

    @patch.object(CoreographyViewSet, 'get_queryset')
    @patch.object(CoreographyViewSet, 'filter_queryset')
    def test_root_list_route_is_available(self, mock_filter, mock_get_queryset):
        mock_get_queryset.return_value = []
        mock_filter.return_value = []

        response = self.client.get("/api/choreographies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CoreographyCreateTest(SimpleTestCase):
    def test_unauthenticated_denied(self):
        req = factory.post("/api/choreographies/", {
            "c_name": "New Dance", "dificulty_level": "basic", "price": "15000.00",
        }, format="json")
        view = CoreographyViewSet.as_view({"post": "create"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_client_denied(self):
        user = _make_user(u_type="client")
        req = factory.post("/api/choreographies/", {
            "c_name": "New Dance", "dificulty_level": "basic", "price": "15000.00",
        }, format="json")
        force_authenticate(req, user=user)
        view = CoreographyViewSet.as_view({"post": "create"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CoreographyRetrieveTest(SimpleTestCase):
    @patch.object(CoreographyViewSet, 'get_object')
    def test_retrieve_existing(self, mock_get_object):
        c = _make_coreography()
        mock_get_object.return_value = c

        req = factory.get("/api/choreographies/1/")
        view = CoreographyViewSet.as_view({"get": "retrieve"})
        response = view(req, pk=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch.object(CoreographyViewSet, 'get_object')
    def test_retrieve_not_found(self, mock_get_object):
        mock_get_object.side_effect = Http404

        req = factory.get("/api/choreographies/999/")
        view = CoreographyViewSet.as_view({"get": "retrieve"})
        response = view(req, pk=999)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CoreographyDestroyTest(SimpleTestCase):
    @patch.object(CoreographyViewSet, 'get_object')
    def test_destroy_soft_delete(self, mock_get_object):
        c = _make_coreography(status="active")
        mock_get_object.return_value = c

        admin = _make_user(u_type="admin")
        req = factory.delete("/api/choreographies/1/")
        force_authenticate(req, user=admin)
        view = CoreographyViewSet.as_view({"delete": "destroy"})
        response = view(req, pk=1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(c.status, "inactive")
        c.save.assert_called_once_with(update_fields=["status"])


class CoreographyTopSellingTest(SimpleTestCase):
    def test_top_selling_not_implemented(self):
        req = factory.get("/api/choreographies/top-selling/")
        view = CoreographyViewSet.as_view({"get": "top_selling"})
        with self.assertRaises(NotImplementedError):
            view(req)


# ---------------------------------------------------------------------------
# VideoViewSet
# ---------------------------------------------------------------------------

class VideoListTest(SimpleTestCase):
    @patch.object(VideoViewSet, 'get_queryset')
    @patch.object(VideoViewSet, 'get_serializer')
    @patch("apps.choreographies.views.Video.objects")
    def test_list_all(self, mock_objects, mock_serializer, mock_get_qs):
        mock_serializer.return_value.data = [{"id": 1}]
        qs = MagicMock()
        qs.__iter__.return_value = [MagicMock()]
        mock_get_qs.return_value = qs

        view = VideoViewSet.as_view({"get": "list"})
        req = factory.get("/api/choreographies/videos/")
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch.object(VideoViewSet, 'get_queryset')
    @patch.object(VideoViewSet, 'get_serializer')
    @patch("apps.choreographies.views.Video.objects")
    def test_list_filter_by_coreography(self, mock_objects, mock_serializer, mock_get_qs):
        mock_serializer.return_value.data = [{"id": 1}]
        qs = MagicMock()
        qs.__iter__.return_value = [MagicMock()]
        qs.filter.return_value = qs
        mock_get_qs.return_value = qs

        view = VideoViewSet.as_view({"get": "list"})
        req = factory.get("/api/choreographies/videos/?coreography=1")
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        qs.filter.assert_called_with(coreography_id="1")
