import React from 'react';
import Chart from 'react-apexcharts';

const TopChoreographies = ({ data = [], title = "Coreografías Más Vendidas" }) => {
  const options = {
    chart: { type: "bar", height: 300, toolbar: { show: true } },
    title: { text: title, align: "left", style: { fontSize: "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.c_name),
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      labels: { formatter: (v) => Math.round(v) },
    },
    colors: ["#ff6a3f", "#e5598f", "#ffabcb", "#ff9b7d", "#bd4475"],
    plotOptions: {
      bar: { horizontal: true, distributed: true, borderRadius: 4 },
    },
    tooltip: {
      y: { formatter: (v) => `${v} vendidas` },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${v}`,
      style: { fontSize: "12px", colors: ["#333"] },
    },
  };

  const series = [{
    name: "Veces vendida",
    data: data.map(d => d.times_sold),
  }];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default TopChoreographies;
