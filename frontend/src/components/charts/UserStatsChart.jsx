import React from 'react';
import Chart from 'react-apexcharts';

const UserStatsChart = ({ data = [], title = "Usuarios Nuevos por Mes" }) => {
  const options = {
    chart: { type: "area", height: 300, toolbar: { show: true } },
    title: { text: title, align: "left", style: { fontSize: "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.month || d.mes),
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      labels: { formatter: (v) => Math.round(v) },
    },
    colors: ["#e5598f"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1 },
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (v) => `${v} usuarios` },
    },
  };

  const series = [{
    name: "Usuarios nuevos",
    data: data.map(d => d.count),
  }];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default UserStatsChart;
