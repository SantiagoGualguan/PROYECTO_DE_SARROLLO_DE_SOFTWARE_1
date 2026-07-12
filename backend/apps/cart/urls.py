from django.urls import path

from .views import (
    CartItemDetailView,
    CartItemListCreateView,
    ShoppingCartView,
)

app_name = "cart"

urlpatterns = [
    # GET  -> ver carrito activo
    # DELETE -> vaciar carrito activo (antes solo tenía una nota, sin view)
    path("cart/", ShoppingCartView.as_view(), name="cart-detail"),
    path("cart/items/", CartItemListCreateView.as_view(), name="cart-items"),
    path("cart/items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]