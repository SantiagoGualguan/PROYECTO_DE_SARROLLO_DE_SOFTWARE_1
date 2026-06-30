from unittest.mock import MagicMock
from django.test import SimpleTestCase
from apps.choreographies.serializers import CoreographySerializer, VideoSerializer


class CoreographySerializerTest(SimpleTestCase):
    def test_serializer_contains_expected_fields(self):
        serializer = CoreographySerializer()
        expected = {
            "coreography_id", "c_name", "image_url", "c_description",
            "dificulty_level", "song_name", "song_genre", "price",
            "times_sold", "profesor", "assistent_profesor",
            "status", "creation_date",
        }
        self.assertEqual(set(serializer.fields.keys()), expected)

    def test_creation_date_read_only(self):
        serializer = CoreographySerializer()
        self.assertTrue(serializer.fields["creation_date"].read_only)

    def test_create_sets_creation_date(self):
        data = {
            "c_name": "Test Dance",
            "dificulty_level": "basic",
            "price": "10000.00",
            "status": "active",
        }
        serializer = CoreographySerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

    def test_invalid_difficulty_level(self):
        data = {
            "c_name": "Test",
            "dificulty_level": "expert",
            "price": "10000.00",
        }
        serializer = CoreographySerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("dificulty_level", serializer.errors)


class VideoSerializerTest(SimpleTestCase):
    def test_serializer_contains_expected_fields(self):
        serializer = VideoSerializer()
        expected = {"video_id", "video_name", "video_url", "coreography", "upload_date"}
        self.assertEqual(set(serializer.fields.keys()), expected)

    def test_upload_date_read_only(self):
        serializer = VideoSerializer()
        self.assertTrue(serializer.fields["upload_date"].read_only)

    def test_valid_video_data(self):
        mock_qs = MagicMock()
        mock_qs.get.return_value = MagicMock()
        data = {
            "video_name": "Test Video",
            "video_url": "https://youtube.com/embed/test",
            "coreography": 1,
        }
        serializer = VideoSerializer(data=data)
        serializer.fields["coreography"].queryset = mock_qs
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
