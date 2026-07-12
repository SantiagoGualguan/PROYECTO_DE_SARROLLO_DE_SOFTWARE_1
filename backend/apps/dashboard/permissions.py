from rest_framework.permissions import BasePermission


class IsAdminOrDirector(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "u_type", None) in ["admin", "director"]


class IsProfesor(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "u_type", None) == "profesor"


class IsCliente(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "u_type", None) == "client"
