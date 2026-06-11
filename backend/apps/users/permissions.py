from rest_framework.permissions import SAFE_METHODS, BasePermission

class IsAuthenticatedUser(BasePermission):
    """Base helper class to ensure the user is logged in."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsAdmin(BasePermission):
    """Strictly checks if u_type == 'admin'"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return getattr(request.user, "u_type", None) == "admin"


class IsDirector(BasePermission):
    """Strictly checks if u_type == 'director'"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return getattr(request.user, "u_type", None) == "director"


class IsAdminOrDirector(BasePermission):
    """
    Strictly limits access to users with 'admin' or 'director' roles.
    Used for sensitive tasks like approving or registering teachers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "u_type", None) in ["admin", "director"]


class IsProfesor(BasePermission):
    """Strictly checks if u_type == 'profesor'"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return getattr(request.user, "u_type", None) == "profesor"

class IsCliente(BasePermission):
    """Strictly checks if u_type == 'cliente'"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view): return False
        return getattr(request.user, "u_type", None) == "cliente"