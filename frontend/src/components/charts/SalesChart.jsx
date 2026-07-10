import React from 'react';
import Chart from 'react-apexcharts';

const SalesChart = ({ data = [], title = "Ventas por Mes", dataKey = "revenue", type = "line" }) => {
  const options = {
    chart: { type, height: 300, toolbar: { show: true } },
    title: { text: title, align: "left", style: { fontSize: "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.month || d.mes),
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      labels: { formatter: (v) => `$${Number(v).toLocaleString("es-CO")}` },
    },
    colors: ["#e5598f"],
    stroke: { curve: "smooth", width: 3 },
    fill: type === "area" ? {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 },
    } : {},
    tooltip: {
      y: { formatter: (v) => `$${Number(v).toLocaleString("es-CO")}` },
    },
    dataLabels: { enabled: false },
  };

  const series = [{
    name: dataKey === "revenue" ? "Ingresos" : "Cantidad",
    data: data.map(d => d[dataKey]),
  }];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <Chart options={options} series={series} type={type} height={300} />
    </div>
  );
};

export default SalesChart;
