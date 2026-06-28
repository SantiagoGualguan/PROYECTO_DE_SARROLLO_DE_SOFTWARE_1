import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import UserStatsChart from "../../components/charts/UserStatsChart";
import Header from "../../components/layout/Header/Header.jsx";

const DirectorDashboard = () => {
  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Solicitudes", to: "/director/solicitudes" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Solicitudes de profesores", to: "/director/solicitudes" },
          { label: "Usuarios", to: "/admin/usuarios" },
        ]}
      />
      <h1>DirectorDashboard</h1>
      {/* DirectorDashboard: igual que admin + rendimiento por profesor */}
      <SalesChart />
      <TopChoreographies />
      <UserStatsChart />
      {/* TODO: agregar gráficos de rendimiento por profesor */}
    </div>
  );
};

export default DirectorDashboard;
