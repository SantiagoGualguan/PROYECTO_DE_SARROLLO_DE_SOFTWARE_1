import React from 'react';
import Chart from 'react-apexcharts';

const SalesChart = () => {
  // TODO: configurar gráfico de ventas con ApexCharts
  const options = {};
  const series = [];

  return (
    <div>
      <h2>SalesChart</h2>
      <Chart options={options} series={series} type="line" height={300} />
      {/* TODO: reemplazar configuración de ejemplo por datos reales */}
    </div>
  );
};

export default SalesChart;

