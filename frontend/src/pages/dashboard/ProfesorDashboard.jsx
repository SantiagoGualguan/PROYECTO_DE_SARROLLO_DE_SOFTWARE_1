import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { DashboardService } from "../../api/dashboardService";

const ProfesorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getProfesorDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;
  if (!data) return <div className="flex justify-center p-8 text-red-500">Error al cargar dashboard</div>;

  const summaryCards = [
    { label: "Mis Coreografías", value: data.my_choreographies_count, color: "text-purple-600" },
    { label: "Ventas Totales", value: data.total_sales, color: "text-blue-600" },
    { label: "Ingresos Generados", value: `$${Number(data.total_revenue).toLocaleString("es-CO")}`, color: "text-green-600" },
  ];

  return (
    <div>
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Catalogo", to: "/coreografias" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        rightActions={[
          {
            label: "mi perfil",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/perfil"),
          },
        ]}
      />
      <div className="p-6 max-w-7xl mx-auto">
        <Typography variant="h4" className="mb-6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
          Panel del Profesor
        </Typography>

        <Grid container spacing={3} className="mb-6">
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.label}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }} className={card.color}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} md={8}>
            <SalesChart
              data={data.sales_by_month}
              title="Mis Ingresos por Mes"
              dataKey="revenue"
              type="line"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {data.choreographies && data.choreographies.length > 0 && (
              <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Resumen por Coreografía
                  </Typography>
                  {data.choreographies.slice(0, 5).map((ch) => (
                    <div key={ch.coreography_id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <Typography variant="body2" sx={{ maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ch.c_name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ch.times_sold} ventas
                      </Typography>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TopChoreographies
              data={(data.choreographies || []).sort((a, b) => b.times_sold - a.times_sold)}
              title="Rendimiento de Mis Coreografías"
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default ProfesorDashboard;
