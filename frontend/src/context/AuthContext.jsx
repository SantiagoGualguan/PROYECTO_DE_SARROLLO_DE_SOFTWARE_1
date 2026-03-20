import React, { createContext, useContext } from 'react';

// TODO: proveer: user, token, rol, login(), logout(), isAuthenticated
// TODO: al login, guardar access y refresh token en localStorage
// TODO: al cargar la app, verificar si hay token válido

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const value = {
    user: null,
    token: null,
    rol: null,
    login: () => {
      throw new Error('TODO: implementar login en AuthContext');
    },
    logout: () => {
      throw new Error('TODO: implementar logout en AuthContext');
    },
    isAuthenticated: false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

