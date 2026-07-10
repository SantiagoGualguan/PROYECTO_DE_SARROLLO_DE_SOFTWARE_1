import json
from unittest.mock import MagicMock, patch, PropertyMock
from django.core.signing import SignatureExpired as SigExpired
from django.test import SimpleTestCase, override_settings
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.views import AuthViewSet, InternalUserViewSet, ClientProfileViewSet
from apps.users.serializers import INTERNAL_ALLOWED_ROLES


factory = APIRequestFactory()


def _build_request(method, path, data=None, user=None, token=None):
    """Helper to build an authenticated or anonymous request."""
    if method == "get":
        req = factory.get(path)
    elif method == "post":
        req = factory.post(path, data=data, format="json")
    elif method == "put":
        req = factory.put(path, data=data, format="json")
    elif method == "patch":
        req = factory.patch(path, data=data, format="json")
    elif method == "delete":
        req = factory.delete(path)
    else:
        req = factory.get(path)

    if user:
        force_authenticate(req, user=user)
    if token:
        req.META["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    return req


def _make_user(u_type="client", user_id=1, is_active=True, validated=True, **kwargs):
    user = MagicMock()
    user.id = user_id
    user.pk = user_id
    user.u_name = kwargs.get("u_name", "Test")
    user.last_name = kwargs.get("last_name", "User")
    user.u_type = u_type
    user.is_active = is_active
    user.validated = validated
    user.is_authenticated = True
    return user


# ---------------------------------------------------------------------------
# AuthViewSet tests
# ---------------------------------------------------------------------------

class AuthLoginTest(SimpleTestCase):
    def setUp(self):
        self.view = AuthViewSet.as_view({"post": "login"})

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.CustomUser.objects")
    @patch("apps.users.views.RefreshToken")
    def test_login_success_client(self, mock_refresh, mock_user_objects, mock_turnstile):
        user = _make_user(u_type="client")
        mock_user_objects.authenticate_by_identifier.return_value = user
        mock_refresh.for_user.return_value.access_token = MagicMock()
        mock_refresh.for_user.return_value.access_token.__str__ = lambda s: "access-token-123"
        mock_refresh.for_user.return_value.__str__ = lambda s: "refresh-token-456"

        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid-captcha",
            "identifier": "test@example.com",
            "password": "password123",
        })
        response = self.view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["role"], "client")

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.CustomUser.objects")
    @patch("apps.users.views.RefreshToken")
    def test_login_profesor_validated(self, mock_refresh, mock_user_objects, mock_turnstile):
        user = _make_user(u_type="profesor", validated=True)
        mock_user_objects.authenticate_by_identifier.return_value = user
        mock_refresh.for_user.return_value.access_token = MagicMock()
        mock_refresh.for_user.return_value.access_token.__str__ = lambda s: "access-token"
        mock_refresh.for_user.return_value.__str__ = lambda s: "refresh-token"

        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid",
            "email": "profesor@test.com",
            "password": "pass1234",
        })
        response = self.view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_missing_captcha(self):
        req = _build_request("post", "/api/auth/login/", {
            "email": "test@test.com",
            "password": "pass1234",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("CAPTCHA", str(response.data["detail"]))

    @patch("apps.users.views.verify_turnstile_token", return_value=False)
    def test_login_invalid_captcha(self, mock_turnstile):
        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "bad-token",
            "email": "test@test.com",
            "password": "pass1234",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.CustomUser.objects")
    def test_login_invalid_credentials(self, mock_user_objects, mock_turnstile):
        mock_user_objects.authenticate_by_identifier.return_value = None
        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid",
            "identifier": "wrong@test.com",
            "password": "wrongpass",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_identifier(self):
        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid",
            "password": "pass1234",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.CustomUser.objects")
    def test_login_inactive_user(self, mock_user_objects, mock_turnstile):
        user = _make_user(u_type="client", is_active=False)
        mock_user_objects.authenticate_by_identifier.return_value = user
        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid",
            "identifier": "inactive@test.com",
            "password": "pass1234",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("inactivo", str(response.data["detail"]).lower())

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.CustomUser.objects")
    def test_login_unvalidated_profesor(self, mock_user_objects, mock_turnstile):
        user = _make_user(u_type="profesor", validated=False)
        mock_user_objects.authenticate_by_identifier.return_value = user
        req = _build_request("post", "/api/auth/login/", {
            "captcha_token": "valid",
            "identifier": "pendiente@test.com",
            "password": "pass1234",
        })
        response = AuthViewSet.as_view({"post": "login"})(req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("pendiente", str(response.data["detail"]).lower())


class AuthRegisterTest(SimpleTestCase):
    @patch("apps.users.views._create_user_with_sql")
    @patch("apps.users.views.RefreshToken")
    def test_register_client(self, mock_refresh, mock_create_user):
        user = _make_user(u_type="client", user_id=10)
        mock_create_user.return_value = user
        mock_refresh.for_user.return_value.access_token = MagicMock()
        mock_refresh.for_user.return_value.access_token.__str__ = lambda s: "access-abc"
        mock_refresh.for_user.return_value.__str__ = lambda s: "refresh-xyz"

        req = _build_request("post", "/api/auth/register/", {
            "first_name": "Nuevo",
            "last_name": "Cliente",
            "password": "securepass123",
            "email": "nuevo@test.com",
            "phone": "3009998877",
            "captcha_token": "valid-captcha",
        })
        response = AuthViewSet.as_view({"post": "register"})(req)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)


class AuthLogoutTest(SimpleTestCase):
    @patch("apps.users.views.RefreshToken")
    def test_logout_valid_token(self, mock_refresh):
        req = _build_request("post", "/api/auth/logout/", {
            "refresh": "valid-refresh-token",
        }, user=_make_user())
        response = AuthViewSet.as_view({"post": "logout"})(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        req = _build_request("post", "/api/auth/logout/", {
            "refresh": "invalid-token",
        }, user=_make_user())
        with patch("apps.users.views.RefreshToken") as mock_rt:
            mock_rt.side_effect = TokenError("bad token")
            response = AuthViewSet.as_view({"post": "logout"})(req)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_no_token(self):
        req = _build_request("post", "/api/auth/logout/", {}, user=_make_user())
        response = AuthViewSet.as_view({"post": "logout"})(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AuthTokenRefreshTest(SimpleTestCase):
    @patch("apps.users.views.RefreshToken")
    def test_refresh_success(self, mock_refresh):
        token_mock = MagicMock()
        token_mock.__getitem__.return_value = 1
        mock_refresh.return_value = token_mock
        mock_refresh.for_user.return_value.access_token.__str__ = lambda s: "new-access"
        mock_refresh.for_user.return_value.__str__ = lambda s: "new-refresh"

        user = _make_user()
        with patch("apps.users.views.CustomUser.objects") as mock_objects:
            mock_objects.filter.return_value.first.return_value = user
            req = _build_request("post", "/api/auth/token-refresh/", {
                "refresh": "valid-refresh"
            })
            response = AuthViewSet.as_view({"post": "token_refresh"})(req)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_refresh_missing_token(self):
        req = _build_request("post", "/api/auth/token-refresh/", {})
        response = AuthViewSet.as_view({"post": "token_refresh"})(req)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.users.views.RefreshToken")
    def test_refresh_inactive_user(self, mock_refresh):
        token_mock = MagicMock()
        token_mock.__getitem__.return_value = 1
        mock_refresh.return_value = token_mock
        user = _make_user(is_active=False)
        with patch("apps.users.views.CustomUser.objects") as mock_objects:
            mock_objects.filter.return_value.first.return_value = user
            req = _build_request("post", "/api/auth/token-refresh/", {
                "refresh": "some-refresh"
            })
            response = AuthViewSet.as_view({"post": "token_refresh"})(req)
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AuthRecoverPasswordTest(SimpleTestCase):
    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.signing")
    @patch("apps.users.views.send_mail")
    @patch("apps.users.views._find_user_by_identifier")
    @patch("apps.users.views.CustomUser.objects")
    def test_recover_success(
        self,
        mock_user_objects,
        mock_find,
        mock_send_mail,
        mock_signing,
        mock_turnstile,
    ):
        user = _make_user()
        mock_find.return_value = user
        mock_signing.dumps.return_value = "reset-token-123"

        req = _build_request("post", "/api/auth/recover-password/", {
            "identifier": "test@test.com",
            "captcha_token": "valid",
        })
        response = AuthViewSet.as_view({"post": "recover_password"})(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("reset_token", response.data)
        self.assertNotIn("reset_url", response.data)
        mock_send_mail.assert_called_once()
        self.assertIn("reset-token-123", mock_send_mail.call_args.kwargs["message"])

    def test_recover_missing_identifier(self):
        req = _build_request("post", "/api/auth/recover-password/", {})
        response = AuthViewSet.as_view({"post": "recover_password"})(req)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthResetPasswordTest(SimpleTestCase):
    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    @patch("apps.users.views.signing")
    def test_reset_success(self, mock_signing, mock_turnstile):
        mock_signing.loads.return_value = {"user_id": 1}
        user = _make_user()
        with patch("apps.users.views.CustomUser.objects") as mock_objects:
            mock_objects.filter.return_value.first.return_value = user
            req = _build_request("post", "/api/auth/reset-password/valid-token/", {
                "new_password": "newpass1234",
                "confirm_password": "newpass1234",
                "captcha_token": "valid",
            })
            view = AuthViewSet.as_view({"post": "reset_password"})
            response = view(req, token="valid-token")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_mismatch(self):
        req = _build_request("post", "/api/auth/reset-password/t/", {
            "new_password": "pass1234",
            "confirm_password": "different",
            "captcha_token": "valid",
        })
        response = AuthViewSet.as_view({"post": "reset_password"})(req, token="t")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.users.views.verify_turnstile_token", return_value=True)
    def test_reset_expired_token(self, mock_turnstile):
        with patch("apps.users.views.signing.loads", side_effect=SigExpired("expired")):
            req = _build_request("post", "/api/auth/reset-password/expired/", {
                "new_password": "pass1234",
                "captcha_token": "valid",
            })
            response = AuthViewSet.as_view({"post": "reset_password"})(req, token="expired")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# InternalUserViewSet tests
# ---------------------------------------------------------------------------

class InternalUserListTest(SimpleTestCase):
    @patch("apps.users.views.CustomUser.objects")
    def test_list_returns_paginated(self, mock_objects):
        qs = MagicMock()
        qs.order_by.return_value = qs
        qs.prefetch_related.return_value = qs
        qs.filter.return_value = qs
        qs.__iter__.return_value = []
        mock_objects.filter.return_value = qs
        mock_objects.prefetch_related.return_value = qs
        mock_objects.order_by.return_value = qs

        with patch.object(InternalUserViewSet, "filter_queryset", return_value=qs):
            req = _build_request("get", "/api/users/internal/", user=_make_user("admin"))
            view = InternalUserViewSet.as_view({"get": "list"})
            response = view(req)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn("count", response.data)
            self.assertIn("results", response.data)


class InternalUserCreateTest(SimpleTestCase):
    @patch("apps.users.views._create_user_with_sql")
    def test_create_admin(self, mock_create_user):
        user = _make_user(u_type="admin", user_id=99)
        mock_create_user.return_value = user

        req = _build_request("post", "/api/users/internal/", {
            "nombre": "New Admin",
            "identificacion": "1111111111",
            "correo": "newadmin@test.com",
            "rol": "admin",
            "contrasena": "securepass123",
        }, user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"post": "create"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("detail", response.data)
        self.assertIn("user", response.data)

    @patch("apps.users.views._create_user_with_sql")
    def test_create_duplicate_email(self, mock_create_user):
        mock_create_user.side_effect = ValueError("El correo ya esta registrado.")
        req = _build_request("post", "/api/users/internal/", {
            "nombre": "Dup User",
            "identificacion": "2222222222",
            "correo": "exists@test.com",
            "rol": "admin",
            "contrasena": "securepass123",
        }, user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"post": "create"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InternalUserRetrieveTest(SimpleTestCase):
    @patch("apps.users.views.CustomUser.objects")
    def test_retrieve_user_not_found(self, mock_objects):
        mock_objects.filter.return_value.prefetch_related.return_value.first.return_value = None
        req = _build_request("get", "/api/users/internal/999/", user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"get": "retrieve"})
        response = view(req, pk=999)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.users.views.CustomUser.objects")
    def test_retrieve_client_user_rejected(self, mock_objects):
        client_user = _make_user(u_type="client", user_id=5)
        mock_objects.filter.return_value.prefetch_related.return_value.first.return_value = client_user
        req = _build_request("get", "/api/users/internal/5/", user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"get": "retrieve"})
        response = view(req, pk=5)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InternalUserDestroyTest(SimpleTestCase):
    @patch("apps.users.views.transaction.atomic")
    @patch("apps.users.views.CustomUser.objects")
    def test_destroy_soft_delete(self, mock_objects, mock_atomic):
        user = _make_user(u_type="admin", user_id=3, is_active=True)
        mock_objects.filter.return_value.first.return_value = user
        req = _build_request("delete", "/api/users/internal/3/", user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"delete": "destroy"})
        response = view(req, pk=3)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.delete.assert_called_once()

    @patch("apps.users.views.CustomUser.objects")
    def test_destroy_already_inactive(self, mock_objects):
        user = _make_user(u_type="director", user_id=4, is_active=False)
        mock_objects.filter.return_value.first.return_value = user
        req = _build_request("delete", "/api/users/internal/4/", user=_make_user("admin"))
        view = InternalUserViewSet.as_view({"delete": "destroy"})
        response = view(req, pk=4)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# ClientProfileViewSet tests
# ---------------------------------------------------------------------------

class ClientProfileMeTest(SimpleTestCase):
    @patch("apps.users.views.CustomUser.objects")
    def test_get_me_success(self, mock_objects):
        user = _make_user(u_type="client", user_id=1)
        user.emails.order_by.return_value.first.return_value = MagicMock(email="cli@test.com")
        user.phone_numbers.order_by.return_value.first.return_value = MagicMock(p_number="3001112233")
        mock_objects.filter.return_value.prefetch_related.return_value.first.return_value = user

        req = _build_request("get", "/api/users/clients/me/", user=user)
        view = ClientProfileViewSet.as_view({"get": "me"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("nombre", response.data)

    def test_get_me_unauthenticated(self):
        req = _build_request("get", "/api/users/clients/me/")
        view = ClientProfileViewSet.as_view({"get": "me"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_wrong_role(self):
        user = _make_user(u_type="admin")
        req = _build_request("get", "/api/users/clients/me/", user=user)
        view = ClientProfileViewSet.as_view({"get": "me"})
        response = view(req)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
