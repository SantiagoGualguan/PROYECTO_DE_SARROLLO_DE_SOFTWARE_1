import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// TODO: si no autenticado → redirigir a /login
// TODO: si autenticado pero rol no permitido → redirigir a /dashboard

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, rol, loading } = useAuth();

  // Esperar a que el contexto lea el localStorage
  if (loading) {
    return null; // o un spinner si prefieres
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
