import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesChart from "../../components/charts/SalesChart";
import TopChoreographies from "../../components/charts/TopChoreographies";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import { DashboardService } from "../../api/dashboardService";

const summaryConfig = [
  {
    label: "Mis Coreografías",
    key: "my_choreographies_count",
    color: "text-purple-600",
    icon: <MusicNoteIcon />,
  },
  {
    label: "Ventas Totales",
    key: "total_sales",
    color: "text-blue-600",
    icon: <TrendingUpIcon />,
  },
  {
    label: "Ingresos Generados",
    key: "total_revenue",
    color: "text-green-600",
    icon: <AttachMoneyIcon />,
    prefix: "$",
    format: true,
  },
];

const ProfesorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    DashboardService.getProfesorDashboard()
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
          { label: "Catalogo", to: "/coreografias" },
          { label: "Mis coreografías", to: "/profesor/coreografias" },
        ]}
        menuItems={[
          { label: "Mis coreografías", to: "/profesor/coreografias" },
          { label: "Subir coreografía", to: "/coreografias/new" },
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
            Panel del Profesor
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
              <Grid item xs={6} md={4} key={card.key}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={card.color}>{card.icon}</span>
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
          <Grid item xs={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => navigate("/coreografias/new")}
            >
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="h5" sx={{ fontSize: "1.8rem", mb: 0.5 }}>
                  +
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nueva coreografía
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Grid item xs={12} lg={8}>
            <SalesChart
              data={d.sales_by_month || []}
              title="Mis Ingresos por Mes"
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
                <div className="flex items-center gap-2 mb-2">
                  <EmojiEventsIcon className="text-amber-500" />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                    }}
                  >
                    Mis Coreografías
                  </Typography>
                </div>
                {(d.choreographies || []).length > 0 ? (
                  d.choreographies.map((ch, i) => {
                    const rankColor =
                      i === 0
                        ? "text-amber-500"
                        : i === 1
                          ? "text-gray-400"
                          : i === 2
                            ? "text-orange-400"
                            : "text-gray-600";
                    return (
                      <div
                        key={ch.coreography_id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, fontSize: "0.8rem" }}
                            className={rankColor}
                          >
                            #{i + 1}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.85rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ch.c_name}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Chip
                            label={`${ch.times_sold}`}
                            size="small"
                            color={
                              ch.times_sold > 15
                                ? "success"
                                : ch.times_sold > 8
                                  ? "warning"
                                  : "default"
                            }
                            sx={{
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              height: { xs: 22, sm: 28 },
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: { xs: "none", sm: "block" },
                              fontSize: "0.7rem",
                            }}
                          >
                            ${Number(ch.revenue).toLocaleString("es-CO")}
                          </Typography>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
                  >
                    Aún no tienes coreografías creadas.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12}>
            <TopChoreographies
              data={(d.choreographies || []).sort(
                (a, b) => b.times_sold - a.times_sold,
              )}
              title="Rendimiento de Mis Coreografías"
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default ProfesorDashboard;
