import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';

const SalesChart = ({ data = [], title = "Ventas por Mes", dataKey = "revenue", type = "line" }) => {
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
    chart: { type, height: chartHeight, width: '100%', toolbar: { show: chartWidth > 400 } },
    title: { text: title, align: "left", style: { fontSize: chartWidth < 500 ? "14px" : "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.month || d.mes),
      labels: { style: { fontSize: chartWidth < 500 ? "10px" : "12px" }, rotate: chartWidth < 500 ? -45 : 0 },
    },
    yaxis: {
      show: chartWidth > 350,
      labels: { formatter: (v) => `$${Number(v).toLocaleString("es-CO")}` },
    },
    colors: ["#e5598f"],
    stroke: { curve: "smooth", width: chartWidth < 500 ? 2 : 3 },
    fill: type === "area" ? {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 },
    } : {},
    tooltip: {
      y: { formatter: (v) => `$${Number(v).toLocaleString("es-CO")}` },
    },
    dataLabels: { enabled: false },
    grid: { show: chartWidth > 400 },
    legend: { show: chartWidth > 400 },
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
    name: dataKey === "revenue" ? "Ingresos" : "Cantidad",
    data: data.map(d => d[dataKey]),
  }];

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 w-full">
      <Chart options={options} series={series} type={type} height={chartHeight} width="100%" />
    </div>
  );
};

export default SalesChart;
