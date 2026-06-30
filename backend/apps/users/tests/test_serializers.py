from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase
from rest_framework.exceptions import ErrorDetail
from apps.users.serializers import (
    RegisterSerializer,
    InternalUserCreateSerializer,
    InternalUserUpdateSerializer,
    ClientProfileUpdateSerializer,
    InternalUserListSerializer,
    normalize_internal_role,
    CustomUserSerializer,
)
from apps.users.models import UserEmail, UserPhoneNumber


class RegisterSerializerTest(SimpleTestCase):
    def test_valid_client_data(self):
        data = {
            "first_name": "Juan",
            "last_name": "Perez",
            "password": "securepass123",
            "email": "juan@test.com",
            "phone": "3001112233",
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["role"], "client")

    def test_valid_profesor_data(self):
        data = {
            "first_name": "Ana",
            "last_name": "Garcia",
            "password": "securepass123",
            "email": "ana@test.com",
            "phone": "3004445566",
            "role": "profesor",
            "biography": "Dance teacher",
            "years_of_experience": 5,
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["role"], "profesor")
        self.assertEqual(serializer.validated_data["years_of_experience"], 5)

    def test_profesor_missing_years_of_experience(self):
        data = {
            "first_name": "Ana",
            "last_name": "Garcia",
            "password": "securepass123",
            "email": "ana@test.com",
            "phone": "3004445566",
            "role": "profesor",
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("years_of_experience", serializer.errors)

    def test_password_too_short(self):
        data = {
            "first_name": "Juan",
            "last_name": "Perez",
            "password": "short",
            "email": "juan@test.com",
            "phone": "3001112233",
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_missing_required_fields(self):
        serializer = RegisterSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn("first_name", serializer.errors)
        self.assertIn("last_name", serializer.errors)
        self.assertIn("password", serializer.errors)
        self.assertIn("email", serializer.errors)
        self.assertIn("phone", serializer.errors)

    def test_invalid_email(self):
        data = {
            "first_name": "Juan",
            "last_name": "Perez",
            "password": "securepass123",
            "email": "not-an-email",
            "phone": "3001112233",
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_invalid_role(self):
        data = {
            "first_name": "Juan",
            "last_name": "Perez",
            "password": "securepass123",
            "email": "juan@test.com",
            "phone": "3001112233",
            "role": "superadmin",
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)


class InternalUserCreateSerializerTest(SimpleTestCase):
    def test_valid_data_admin(self):
        data = {
            "nombre": "Carlos Admin",
            "identificacion": "1234567890",
            "correo": "carlos@test.com",
            "rol": "admin",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["rol"], "admin")

    def test_valid_data_profesor(self):
        data = {
            "nombre": "Profesor Uno",
            "identificacion": "9876543210",
            "correo": "profesor@test.com",
            "rol": "profesor bailarin",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["rol"], "profesor")

    def test_client_role_rejected(self):
        data = {
            "nombre": "Cliente Uno",
            "identificacion": "1112223334",
            "correo": "client@test.com",
            "rol": "client",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)

    def test_invalid_role(self):
        data = {
            "nombre": "Test User",
            "identificacion": "1234567890",
            "correo": "test@test.com",
            "rol": "invalid_role",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("rol", serializer.errors)

    def test_empty_nombre(self):
        data = {
            "nombre": "   ",
            "identificacion": "1234567890",
            "correo": "test@test.com",
            "rol": "admin",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("nombre", serializer.errors)

    def test_long_identificacion(self):
        data = {
            "nombre": "Test User",
            "identificacion": "1" * 16,
            "correo": "test@test.com",
            "rol": "admin",
            "contrasena": "securepass123",
        }
        serializer = InternalUserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("identificacion", serializer.errors)


class InternalUserUpdateSerializerTest(SimpleTestCase):
    def test_partial_nombre_only(self):
        data = {"nombre": "Nuevo Nombre"}
        serializer = InternalUserUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["nombre"], "Nuevo Nombre")

    def test_empty_data_rejected(self):
        serializer = InternalUserUpdateSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_valid_role(self):
        data = {"rol": "director"}
        serializer = InternalUserUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["rol"], "director")

    def test_validated_field(self):
        data = {"validated": True}
        serializer = InternalUserUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

    def test_is_active_field(self):
        data = {"is_active": False}
        serializer = InternalUserUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)


class ClientProfileUpdateSerializerTest(SimpleTestCase):
    def test_valid_update(self):
        data = {"nombre": "Cliente Actualizado"}
        serializer = ClientProfileUpdateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

    def test_empty_data_rejected(self):
        serializer = ClientProfileUpdateSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_password_min_length(self):
        data = {"contrasena": "short"}
        serializer = ClientProfileUpdateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("contrasena", serializer.errors)

    @patch("apps.users.models.UserEmail.objects")
    @patch("apps.users.models.UserPhoneNumber.objects")
    def test_email_normalization(self, mock_phone, mock_email):
        mock_email.filter.return_value.exists.return_value = False
        data = {"correo": "  Test@Example.COM  "}
        serializer = ClientProfileUpdateSerializer(data=data, context={"user": None})
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["correo"], "test@example.com")


class InternalUserListSerializerTest(SimpleTestCase):
    def test_nombre_field(self):
        user = MagicMock()
        user.u_name = "Carlos"
        user.last_name = "Lopez"
        serializer = InternalUserListSerializer(instance=user)
        data = serializer.data
        self.assertEqual(data["nombre"], "Carlos Lopez")

    def test_nombre_no_lastname(self):
        user = MagicMock()
        user.u_name = "Carlos"
        user.last_name = ""
        serializer = InternalUserListSerializer(instance=user)
        data = serializer.data
        self.assertEqual(data["nombre"], "Carlos")


class CustomUserSerializerTest(SimpleTestCase):
    def test_serializer_exists(self):
        serializer = CustomUserSerializer()
        self.assertIsNotNone(serializer)
