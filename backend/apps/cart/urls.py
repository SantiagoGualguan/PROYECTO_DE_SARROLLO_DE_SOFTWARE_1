from django.urls import path

from .views import CarritoViewSet, ItemCarritoViewSet

carrito_list = CarritoViewSet.as_view({"get": "list"})
item_create = ItemCarritoViewSet.as_view({"post": "create"})
item_delete = ItemCarritoViewSet.as_view({"delete": "destroy"})

urlpatterns = [
    # CART: GET /api/cart/
    path("", carrito_list, name="cart-active"),
    # CART ITEMS:
    path("items/", item_create, name="cart-item-create"),  # POST /api/cart/items/
    path(
        "items/<int:pk>/",
        item_delete,
        name="cart-item-delete",
    ),  # DELETE /api/cart/items/<id>/
    # Nota: la ruta DELETE /api/cart/ para vaciar carrito se manejará en la misma vista usando método HTTP.
]


