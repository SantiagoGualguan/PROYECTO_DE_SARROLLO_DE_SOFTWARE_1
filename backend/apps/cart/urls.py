from django.urls import path

from .views import (
    CartItemDetailView,
    CartItemListCreateView,
    ShoppingCartView,
)

app_name = "cart"

urlpatterns = [
    # GET  -> ver carrito activo
    # DELETE -> vaciar carrito activo
    path("", ShoppingCartView.as_view(), name="cart-detail"),
    path("items/", CartItemListCreateView.as_view(), name="cart-items"),
    path("items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
]