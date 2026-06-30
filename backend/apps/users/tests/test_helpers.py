from unittest.mock import MagicMock, patch, Mock
from urllib.error import URLError

from django.test import SimpleTestCase
from apps.users.views import (
    _split_full_name,
    _get_primary_email,
    _get_primary_phone,
    _serialize_user_profile,
    _find_user_by_identifier,
    verify_turnstile_token,
    _handle_creation_error,
    SQL_CREATION_ERROR,
)
from apps.users.serializers import normalize_internal_role
from apps.users.models import UserEmail, UserPhoneNumber
from rest_framework import status
from rest_framework.response import Response


class SplitFullNameTest(SimpleTestCase):
    def test_two_names(self):
        self.assertEqual(_split_full_name("Juan Perez"), ("Juan", "Perez"))

    def test_three_names(self):
        self.assertEqual(_split_full_name("Maria Jose Garcia"), ("Maria", "Jose Garcia"))

    def test_single_name(self):
        self.assertEqual(_split_full_name("Carlos"), ("Carlos", "."))

    def test_empty_string(self):
        self.assertEqual(_split_full_name(""), ("", ""))

    def test_whitespace_padding(self):
        self.assertEqual(_split_full_name("  Ana  Lopez  "), ("Ana", "Lopez"))

    def test_only_spaces(self):
        self.assertEqual(_split_full_name("   "), ("", ""))


class NormalizeInternalRoleTest(SimpleTestCase):
    def test_admin_lowercase(self):
        self.assertEqual(normalize_internal_role("admin"), "admin")

    def test_admin_mixed_case(self):
        self.assertEqual(normalize_internal_role("Admin"), "admin")

    def test_administrador_spanish(self):
        self.assertEqual(normalize_internal_role("administrador"), "admin")

    def test_director(self):
        self.assertEqual(normalize_internal_role("director"), "director")

    def test_profesor(self):
        self.assertEqual(normalize_internal_role("profesor"), "profesor")

    def test_profesor_bailarin(self):
        self.assertEqual(normalize_internal_role("profesor bailarin"), "profesor")

    def test_profesor_bailarin_accent(self):
        self.assertEqual(normalize_internal_role("profesor bailarín"), "profesor")

    def test_client_passthrough(self):
        self.assertEqual(normalize_internal_role("client"), "client")

    def test_unknown_role(self):
        self.assertEqual(normalize_internal_role("unknown"), "unknown")


class GetPrimaryEmailTest(SimpleTestCase):
    def test_with_email(self):
        email = MagicMock()
        email.email = "test@example.com"
        user = MagicMock()
        user.emails.order_by.return_value.first.return_value = email
        self.assertEqual(_get_primary_email(user), "test@example.com")

    def test_no_email(self):
        user = MagicMock()
        user.emails.order_by.return_value.first.return_value = None
        self.assertIsNone(_get_primary_email(user))


class GetPrimaryPhoneTest(SimpleTestCase):
    def test_with_phone(self):
        phone = MagicMock()
        phone.p_number = "3001234567"
        user = MagicMock()
        user.phone_numbers.order_by.return_value.first.return_value = phone
        self.assertEqual(_get_primary_phone(user), "3001234567")

    def test_no_phone(self):
        user = MagicMock()
        user.phone_numbers.order_by.return_value.first.return_value = None
        self.assertIsNone(_get_primary_phone(user))


class SerializeUserProfileTest(SimpleTestCase):
    def test_full_profile(self):
        email_rel = MagicMock()
        email_rel.email = "user@test.com"
        phone_rel = MagicMock()
        phone_rel.p_number = "3009876543"
        user = MagicMock()
        user.id = 1
        user.u_name = "Carlos"
        user.last_name = "Lopez"
        user.u_type = "client"
        user.is_active = True
        user.validated = True
        user.creation_date = None
        user.emails.order_by.return_value.first.return_value = email_rel
        user.phone_numbers.order_by.return_value.first.return_value = phone_rel

        result = _serialize_user_profile(user)
        self.assertEqual(result["id"], 1)
        self.assertEqual(result["nombre"], "Carlos Lopez")
        self.assertEqual(result["correo"], "user@test.com")
        self.assertEqual(result["identificacion"], "3009876543")
        self.assertEqual(result["rol"], "client")
        self.assertTrue(result["is_active"])
        self.assertTrue(result["validated"])


class FindUserByIdentifierTest(SimpleTestCase):
    @patch("apps.users.views.UserEmail.objects")
    def test_find_by_email(self, mock_email_objects):
        user = MagicMock()
        email_rel = MagicMock()
        email_rel.user = user
        mock_email_objects.select_related.return_value.get.return_value = email_rel
        result = _find_user_by_identifier("test@example.com")
        self.assertEqual(result, user)

    @patch("apps.users.views.UserEmail.objects")
    @patch("apps.users.views.UserPhoneNumber.objects")
    def test_find_by_phone(self, mock_phone_objects, mock_email_objects):
        mock_email_objects.select_related.return_value.get.side_effect = UserEmail.DoesNotExist(
            "not found"
        )
        user = MagicMock()
        phone_rel = MagicMock()
        phone_rel.user = user
        mock_phone_objects.select_related.return_value.get.return_value = phone_rel
        result = _find_user_by_identifier("3001234567")
        self.assertEqual(result, user)

    def test_empty_identifier(self):
        self.assertIsNone(_find_user_by_identifier(""))
        self.assertIsNone(_find_user_by_identifier(None))

    @patch("apps.users.views.UserEmail.objects")
    def test_not_found(self, mock_email_objects):
        mock_email_objects.select_related.return_value.get.side_effect = UserEmail.DoesNotExist(
            "not found"
        )
        with patch("apps.users.views.UserPhoneNumber.objects") as mock_phone:
            mock_phone.select_related.return_value.get.side_effect = UserPhoneNumber.DoesNotExist(
                "not found"
            )
            result = _find_user_by_identifier("unknown")
            self.assertIsNone(result)


class VerifyTurnstileTokenTest(SimpleTestCase):
    @patch("apps.users.views.settings")
    @patch("apps.users.views.urlopen")
    def test_successful_verification(self, mock_urlopen, mock_settings):
        mock_settings.TURNSTILE_SECRET_KEY = "test-secret"
        mock_response = MagicMock()
        mock_response.read.return_value.decode.return_value = '{"success": true}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        self.assertTrue(verify_turnstile_token("valid-token"))

    def test_missing_token(self):
        self.assertFalse(verify_turnstile_token(""))
        self.assertFalse(verify_turnstile_token(None))

    @patch("apps.users.views.settings")
    def test_missing_secret_key(self, mock_settings):
        mock_settings.TURNSTILE_SECRET_KEY = None
        self.assertFalse(verify_turnstile_token("some-token"))

    @patch("apps.users.views.settings")
    @patch("apps.users.views.urlopen")
    def test_failed_verification(self, mock_urlopen, mock_settings):
        mock_settings.TURNSTILE_SECRET_KEY = "test-secret"
        mock_response = MagicMock()
        mock_response.read.return_value.decode.return_value = '{"success": false}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        self.assertFalse(verify_turnstile_token("invalid-token"))

    @patch("apps.users.views.settings")
    @patch("apps.users.views.urlopen")
    def test_network_error(self, mock_urlopen, mock_settings):
        mock_settings.TURNSTILE_SECRET_KEY = "test-secret"
        mock_urlopen.side_effect = URLError("timeout")
        self.assertFalse(verify_turnstile_token("some-token"))


class HandleCreationErrorTest(SimpleTestCase):
    def test_value_error(self):
        exc = ValueError("bad data")
        response = _handle_creation_error(exc)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "bad data")

    def test_runtime_error(self):
        exc = RuntimeError(SQL_CREATION_ERROR)
        response = _handle_creation_error(exc)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["detail"], SQL_CREATION_ERROR)
