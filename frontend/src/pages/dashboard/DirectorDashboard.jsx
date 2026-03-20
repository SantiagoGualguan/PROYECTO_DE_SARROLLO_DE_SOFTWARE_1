import React from 'react';
import SalesChart from '../../components/charts/SalesChart';
import TopChoreographies from '../../components/charts/TopChoreographies';
import UserStatsChart from '../../components/charts/UserStatsChart';

const DirectorDashboard = () => {
  return (
    <div>
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

