import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import Header from "../../components/layout/Header/Header.jsx";

const ProfesorDashboard = () => {
  return (
    <div>
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Catalogo", to: "/coreografías" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        rightActions={[
          {
            label: "mi perfil",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/perfil"),
          },
        ]}
      />
      <h1>ProfesorDashboard</h1>
      {/* ProfesorDashboard: ventas de sus coreografías, videos más vistos, ingresos */}
      <SalesChart />
      <TopChoreographies />
      {/* TODO: ajustar gráficos a métricas específicas del profesor */}
    </div>
  );
};

export default ProfesorDashboard;
