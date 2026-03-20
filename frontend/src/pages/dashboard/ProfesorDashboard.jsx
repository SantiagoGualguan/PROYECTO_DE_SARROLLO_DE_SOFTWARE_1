import React from 'react';
import SalesChart from '../../components/charts/SalesChart';
import TopChoreographies from '../../components/charts/TopChoreographies';

const ProfesorDashboard = () => {
  return (
    <div>
      <h1>ProfesorDashboard</h1>
      {/* ProfesorDashboard: ventas de sus coreografías, videos más vistos, ingresos */}
      <SalesChart />
      <TopChoreographies />
      {/* TODO: ajustar gráficos a métricas específicas del profesor */}
    </div>
  );
};

export default ProfesorDashboard;

