from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    # TODO: verificar rol == 'admin'
    pass


class IsDirector(BasePermission):
    # TODO: verificar rol == 'director'
    pass


class IsAdminOrDirector(BasePermission):
    # TODO: verificar rol en ['admin', 'director']
    pass


class IsProfesor(BasePermission):
    # TODO: verificar rol == 'profesor'
    pass


class IsCliente(BasePermission):
    # TODO: verificar rol == 'cliente'
    pass

