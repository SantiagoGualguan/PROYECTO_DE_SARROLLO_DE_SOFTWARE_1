import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartService } from "../api/cartService";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(() => {
    setLoading(true);
    CartService.getActiveCart()
      .then((res) => {
        setItems(res.data.items || []);
        setCartId(res.data.cart_id);
        setError(null);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setItems([]);
          setCartId(null);
          setError(null);
        } else {
          setError("Error al cargar el carrito");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (coreographyId) => {
    const res = await CartService.addItem(coreographyId);
    setItems(res.data.items || []);
    setCartId(res.data.cart_id);
    return res;
  }, []);

  const removeItem = useCallback(async (cartItemId) => {
    await CartService.removeItem(cartItemId);
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  }, []);

  // DELETE /api/cart/ empties the active cart. Treat 404 as already-empty
  // (e.g. cart was completed by a successful purchase).
  const clearCart = useCallback(async () => {
    try {
      await CartService.clearCart();
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }
    setItems([]);
    setCartId(null);
  }, []);

  // Local-only clear after purchase: backend already sets s_status=completed.
  const resetLocalCart = useCallback(() => {
    setItems([]);
    setCartId(null);
  }, []);

  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.unit_price || 0);
  }, 0);

  const value = {
    items,
    cartId,
    loading,
    error,
    total,
    itemCount: items.length,
    addItem,
    removeItem,
    clearCart,
    resetLocalCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
