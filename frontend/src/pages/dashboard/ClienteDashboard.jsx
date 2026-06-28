import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import Header from "../../components/layout/Header/Header.jsx";
import { useNavigate } from "react-router-dom";

const ClienteDashboard = () => {
  const navigate = useNavigate();
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
      <h1>ClienteDashboard</h1>
      {/* ClienteDashboard: compras realizadas, historial, coreografías disponibles */}
      {/* <SalesChart /> */}
      {/* TODO: mostrar historial de compras y accesos rápidos a coreografías */}
      Dashboard de cliente: mostrar historial de compras, coreografías
      disponibles y accesos rápidos a funciones relevantes para el cliente.
    </div>
  );
};

export default ClienteDashboard;
