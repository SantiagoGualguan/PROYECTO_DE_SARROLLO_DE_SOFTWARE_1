import React from 'react';
import Chart from 'react-apexcharts';

const UserStatsChart = () => {
  // TODO: configurar gráfico de estadísticas de usuarios
  const options = {};
  const series = [];

  return (
    <div>
      <h2>UserStatsChart</h2>
      <Chart options={options} series={series} type="area" height={300} />
      {/* TODO: reemplazar configuración de ejemplo por datos reales */}
    </div>
  );
};

export default UserStatsChart;

