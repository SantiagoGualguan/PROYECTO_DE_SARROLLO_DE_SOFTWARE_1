import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/public/LandingPage/LandingPage";
import CatalogPublic from "../pages/public/CatalogPublic";
import NotFound from "../pages/public/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RecoverPassword from "../pages/auth/RecoverPassword";
import TeacherApplication from "../pages/auth/TeacherApplication";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import DirectorDashboard from "../pages/dashboard/DirectorDashboard";
import ProfesorDashboard from "../pages/dashboard/ProfesorDashboard";
import ClienteDashboard from "../pages/dashboard/ClienteDashboard";

import UserList from "../pages/users/UserList";
import UserForm from "../pages/users/UserForm";
import UserProfile from "../pages/users/UserProfile";

import ChoreographyList from "../pages/choreographies/ChoreographyList";
import ChoreographyDetail from "../pages/choreographies/ChoreographyDetail";
import ChoreographyForm from "../pages/choreographies/ChoreographyForm";

import CartPage from "../pages/cart/CartPage";

import CheckoutWizard from "../pages/sales/CheckoutWizard";
import SaleConfirmation from "../pages/sales/SaleConfirmation";
import PurchaseHistory from "../pages/sales/PurchaseHistory";

import ProtectedRoute from "../components/common/ProtectedRoute";
import LandingPageV2 from "../pages/public/LandingPageV2";

import TeacherApplicationList from "../pages/users/TeacherApplicationList";
import UserEditForm from "../pages/users/UserEditForm";

// RUTAS PÚBLICAS (sin auth):
// / → LandingPage
// /catalogo → CatalogPublic
// /login → Login
// /registro → Register
// /recuperar-clave → RecoverPassword
// RUTAS PROTEGIDAS (requieren auth + rol específico):
// /dashboard → redirige según rol al dashboard correcto
// /admin/usuarios → UserList [admin, director]
// /admin/usuarios/new → UserForm [admin, director]
// /coreografias → ChoreographyList [admin, director, profesor]
// /coreografias/new → ChoreographyForm [admin, director, profesor]
// /coreografias/:id → ChoreographyDetail [todos autenticados]
// /carrito → CartPage [cliente]
// /checkout → CheckoutWizard [cliente]
// /mis-compras → PurchaseHistory [cliente]
// /perfil → UserProfile [cliente]

const AppRouter = () => {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<CatalogPublic />} />
      <Route path="/landing-v2" element={<LandingPageV2 />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar-clave" element={<RecoverPassword />} />
      <Route path="/solicitud-profesor" element={<TeacherApplication />} />
      {/* Dashboard: redirección según rol (TODO: implementar lógica real) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Administración de usuarios   NO ELIMINAR, DEBE QUEDAR ASI*/}
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute allowedRoles={["admin", "director"]}>
            <UserList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "director"]}>
            <UserForm />
          </ProtectedRoute>
        }
      />

      <Route path="/admin/usuarios/:id/edit" element={<UserEditForm />} />

      {/* Lista de solicitudes de profesor (solo para director) */}
      <Route
        path="/director/solicitudes"
        element={
          <ProtectedRoute allowedRoles={["director", "admin"]}>
            <TeacherApplicationList />
          </ProtectedRoute>
        }
      />
      {/* Coreografías */}
      <Route
        path="/coreografias"
        element={
          <ProtectedRoute allowedRoles={["admin", "director", "profesor"]}>
            <ChoreographyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coreografias/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "director", "profesor"]}>
            <ChoreographyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coreografias/:id"
        element={
          <ProtectedRoute>
            <ChoreographyDetail />
          </ProtectedRoute>
        }
      />
      {/* Carrito y ventas */}
      <Route
        path="/carrito"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <CheckoutWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-compras"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <PurchaseHistory />
          </ProtectedRoute>
        }
      />
      {/* Perfil cliente */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      {/* Dashboards específicos por rol (rutas opcionales adicionales) */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "director"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/director"
        element={
          <ProtectedRoute allowedRoles={["director"]}>
            <DirectorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profesor"
        element={
          <ProtectedRoute allowedRoles={["profesor"]}>
            <ProfesorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/cliente"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClienteDashboard />
          </ProtectedRoute>
        }
      />
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
