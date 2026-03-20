import React from 'react';
import SalesChart from '../../components/charts/SalesChart';

const ClienteDashboard = () => {
  return (
    <div>
      <h1>ClienteDashboard</h1>
      {/* ClienteDashboard: compras realizadas, historial, coreografías disponibles */}
      <SalesChart />
      {/* TODO: mostrar historial de compras y accesos rápidos a coreografías */}
    </div>
  );
};

export default ClienteDashboard;

