import React from 'react';
import Chart from 'react-apexcharts';

const TopChoreographies = () => {
  // TODO: configurar gráfico de coreografías más vendidas
  const options = {};
  const series = [];

  return (
    <div>
      <h2>TopChoreographies</h2>
      <Chart options={options} series={series} type="bar" height={300} />
      {/* TODO: reemplazar configuración de ejemplo por datos reales */}
    </div>
  );
};

export default TopChoreographies;

