import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import UserStatsChart from "../../components/charts/UserStatsChart";
import Header from "../../components/layout/Header/Header.jsx";

const AdminDashboard = () => {
  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Lista de usuarios", to: "/admin/usuarios" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
        ]}
      />
      <h1>AdminDashboard</h1>
      {/* AdminDashboard: total ventas del mes, usuarios nuevos, coreografías más vendidas */}
      <SalesChart />
      <TopChoreographies />
      <UserStatsChart />
      {/* TODO: ajustar cards, métricas y layout */}
    </div>
  );
};

export default AdminDashboard;
