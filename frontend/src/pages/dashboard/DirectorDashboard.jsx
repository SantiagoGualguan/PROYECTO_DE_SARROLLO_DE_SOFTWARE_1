import React, { useEffect, useState } from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import UserStatsChart from "../../components/charts/UserStatsChart";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { DashboardService } from "../../api/dashboardService";

const DirectorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getAdminDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;
  if (!data) return <div className="flex justify-center p-8 text-red-500">Error al cargar dashboard</div>;

  const summaryCards = [
    { label: "Ingresos Totales", value: `$${Number(data.total_revenue).toLocaleString("es-CO")}`, color: "text-green-600" },
    { label: "Usuarios Registrados", value: data.total_users, color: "text-blue-600" },
    { label: "Ventas del Mes", value: data.sales_this_month, color: "text-orange-600" },
    { label: "Nuevos Usuarios del Mes", value: data.new_users_this_month, color: "text-purple-600" },
  ];

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Solicitudes", to: "/director/solicitudes" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Solicitudes de profesores", to: "/director/solicitudes" },
          { label: "Usuarios", to: "/admin/usuarios" },
        ]}
      />
      <div className="p-6 max-w-7xl mx-auto">
        <Typography variant="h4" className="mb-6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
          Panel del Director
        </Typography>

        <Grid container spacing={3} className="mb-6">
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
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
              title="Ingresos por Mes"
              dataKey="revenue"
              type="line"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Usuarios por Rol
                </Typography>
                {Object.entries(data.users_by_role || {}).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <Typography variant="body1" sx={{ textTransform: "capitalize" }}>
                      {role === "client" ? "Clientes" : role === "profesor" ? "Profesores" : role === "director" ? "Directores" : "Administradores"}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {count}
                    </Typography>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopChoreographies data={data.top_choreographies} />
          </Grid>
          <Grid item xs={12} md={6}>
            <UserStatsChart data={data.users_by_month} />
          </Grid>
        </Grid>

        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Typography variant="body2" color="text.secondary">
            Próximamente: rendimiento individual por profesor con gráficos comparativos.
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
