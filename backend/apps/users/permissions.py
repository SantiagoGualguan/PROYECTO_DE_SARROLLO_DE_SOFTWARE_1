from rest_framework.permissions import BasePermission


def _has_role(user, allowed_roles):
    if not user or not user.is_authenticated:
        return False
    return getattr(user, "u_type", None) in allowed_roles


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, {"admin"})


class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, {"director"})


class IsProfesor(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, {"profesor"})


class IsCliente(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, {"client"})

