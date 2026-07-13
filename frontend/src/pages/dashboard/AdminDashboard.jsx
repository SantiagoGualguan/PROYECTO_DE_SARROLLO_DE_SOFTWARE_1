import React, { useEffect, useState } from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import UserStatsChart from "../../components/charts/UserStatsChart";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DashboardService } from "../../api/dashboardService";

const summaryConfig = [
  {
    label: "Ingresos Totales",
    key: "total_revenue",
    prefix: "$",
    color: "text-green-600",
    icon: <AttachMoneyIcon />,
    format: true,
  },
  {
    label: "Usuarios Registrados",
    key: "total_users",
    color: "text-blue-600",
    icon: <PeopleIcon />,
  },
  {
    label: "Coreografías Activas",
    key: "total_choreographies",
    color: "text-purple-600",
    icon: <MusicNoteIcon />,
  },
  {
    label: "Ventas del Mes",
    key: "sales_this_month",
    color: "text-orange-600",
    icon: <ShoppingCartIcon />,
  },
];

const roleLabels = {
  admin: "Administradores",
  director: "Directores",
  profesor: "Profesores",
  client: "Clientes",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    DashboardService.getAdminDashboard()
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Error al cargar datos"),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
      </div>
    );

  const d = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Catalogo", to: "/catalogo" },
          { label: "Coreografías", to: "/admin/coreografias" },
        ]}
        menuItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
          { label: "Coreografías", to: "/admin/coreografias" },
        ]}
        rightActions={[
          {
            label: "salir",
            variant: "outlined",
            color: "error",
            icon: <LogoutIcon />,
            onClick: handleLogout,
          },
        ]}
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1a1a2e",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Panel de Administración
          </Typography>
        </div>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          {summaryConfig.map((card) => {
            const val = d[card.key] ?? 0;
            const display = card.format
              ? `$${Number(val).toLocaleString("es-CO")}`
              : Number(val).toLocaleString("es-CO");
            return (
              <Grid item xs={6} md={3} key={card.key}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${card.color}`}>{card.icon}</span>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                      >
                        {card.label}
                      </Typography>
                    </div>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.1rem", sm: "1.5rem" },
                      }}
                      className={card.color}
                    >
                      {display}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Grid item xs={12} lg={8}>
            <SalesChart
              data={d.sales_by_month || []}
              title="Ingresos por Mes"
              dataKey="revenue"
              type="line"
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  }}
                >
                  Usuarios por Rol
                </Typography>
                {Object.entries(d.users_by_role || {}).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {roleLabels[role] || role}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {count}
                    </Typography>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} lg={6}>
            <TopChoreographies data={d.top_choreographies || []} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <UserStatsChart data={d.users_by_month || []} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default AdminDashboard;
