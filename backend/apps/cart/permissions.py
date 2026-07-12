"""
Permisos para la app cart.

Confirmado con apps/users/models.py:
  CustomUser.u_type es un CharField con choices, y uno de los valores
  exactos es "client" (ROLE_CHOICES = [..., ("client", "cliente")]).
"""
from rest_framework import permissions


class IsClientRole(permissions.BasePermission):
    """Permite el acceso solo si el usuario autenticado es tipo 'client'."""
    message = "Solo los usuarios con rol 'client' pueden operar un carrito."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.u_type == "client"
        )


class IsCartOwner(permissions.BasePermission):
    """
    Permiso a nivel de objeto (opcional, capa extra si en algún punto usas
    get_object() de DRF directamente sobre un ShoppingCart o CartItem).
    Las views actuales ya filtran por dueño en el queryset
    (`user_id=request.user.id` / `cart__user_id=request.user.id`).
    """
    message = "No tienes permiso para operar sobre este carrito."

    def has_object_permission(self, request, view, obj):
        owner_id = getattr(obj, "user_id", None)  # ShoppingCart
        if owner_id is None and hasattr(obj, "cart"):
            owner_id = obj.cart.user_id  # CartItem
        return owner_id == request.user.id