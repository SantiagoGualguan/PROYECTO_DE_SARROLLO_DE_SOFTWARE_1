import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';

const UserStatsChart = ({ data = [], title = "Usuarios Nuevos por Mes" }) => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState('100%');
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setChartWidth(w);
        setChartHeight(w < 500 ? 220 : 300);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const options = {
    chart: { type: "area", height: chartHeight, width: '100%', toolbar: { show: chartWidth > 400 } },
    title: { text: title, align: "left", style: { fontSize: chartWidth < 500 ? "14px" : "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.month || d.mes),
      labels: { style: { fontSize: chartWidth < 500 ? "10px" : "12px" }, rotate: chartWidth < 500 ? -45 : 0 },
    },
    yaxis: {
      show: chartWidth > 350,
      labels: { formatter: (v) => Math.round(v) },
    },
    colors: ["#e5598f"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1 },
    },
    stroke: { curve: "smooth", width: chartWidth < 500 ? 2 : 3 },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (v) => `${v} usuarios` },
    },
    grid: { show: chartWidth > 400 },
    responsive: [{
      breakpoint: 600,
      options: {
        chart: { toolbar: { show: false } },
        grid: { show: false },
        yaxis: { show: false },
      },
    }],
  };

  const series = [{
    name: "Usuarios nuevos",
    data: data.map(d => d.count),
  }];

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 w-full">
      <Chart options={options} series={series} type="area" height={chartHeight} width="100%" />
    </div>
  );
};

export default UserStatsChart;
