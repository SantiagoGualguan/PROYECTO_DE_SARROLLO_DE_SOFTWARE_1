import React from 'react';
import SalesChart from '../../components/charts/SalesChart';
import TopChoreographies from '../../components/charts/TopChoreographies';
import UserStatsChart from '../../components/charts/UserStatsChart';

const AdminDashboard = () => {
  return (
    <div>
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

