import React, { createContext, useContext } from 'react';

// TODO: proveer: items[], addItem(), removeItem(), clearCart(), total

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const value = {
    items: [],
    addItem: () => {
      throw new Error('TODO: implementar addItem en CartContext');
    },
    removeItem: () => {
      throw new Error('TODO: implementar removeItem en CartContext');
    },
    clearCart: () => {
      throw new Error('TODO: implementar clearCart en CartContext');
    },
    total: 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

