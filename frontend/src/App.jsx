import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <AppRouter />
          {/* TODO: implementar layout principal */}
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

