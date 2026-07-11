import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';

const TopChoreographies = ({ data = [], title = "Coreografías Más Vendidas" }) => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState('100%');
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setChartWidth(w);
        setChartHeight(w < 500 ? 250 : 300);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const options = {
    chart: { type: "bar", height: chartHeight, width: '100%', toolbar: { show: chartWidth > 400 } },
    title: { text: title, align: "left", style: { fontSize: chartWidth < 500 ? "14px" : "16px", fontWeight: 600 } },
    xaxis: {
      categories: data.map(d => d.c_name),
      labels: { style: { fontSize: chartWidth < 500 ? "10px" : "12px" } },
    },
    yaxis: {
      show: chartWidth > 350,
      labels: { formatter: (v) => Math.round(v) },
    },
    colors: ["#ff6a3f", "#e5598f", "#ffabcb", "#ff9b7d", "#bd4475"],
    plotOptions: {
      bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: chartWidth < 500 ? '70%' : '60%' },
    },
    tooltip: {
      y: { formatter: (v) => `${v} vendidas` },
    },
    dataLabels: {
      enabled: chartWidth > 350,
      formatter: (v) => `${v}`,
      style: { fontSize: "11px", colors: ["#333"] },
    },
    grid: { show: chartWidth > 400 },
    responsive: [{
      breakpoint: 600,
      options: {
        chart: { toolbar: { show: false } },
        grid: { show: false },
        dataLabels: { enabled: false },
        yaxis: { show: true },
      },
    }],
  };

  const series = [{
    name: "Veces vendida",
    data: data.map(d => d.times_sold),
  }];

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 w-full">
      <Chart options={options} series={series} type="bar" height={chartHeight} width="100%" />
    </div>
  );
};

export default TopChoreographies;
