import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import Footer from "../../components/layout/Footer/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import { DashboardService } from "../../api/dashboardService";

const difficultyColors = {
  basic: "success",
  intermediate: "warning",
  advanced: "error",
};
const difficultyLabels = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const summaryConfig = [
  {
    label: "Coreografías Adquiridas",
    key: "purchased_choreographies_count",
    color: "text-purple-600",
    icon: <LibraryMusicIcon />,
  },
  {
    label: "Total Gastado",
    key: "total_spent",
    color: "text-green-600",
    icon: <AttachMoneyIcon />,
    prefix: "$",
    format: true,
  },
  {
    label: "Compras Realizadas",
    key: "purchase_count",
    color: "text-blue-600",
    icon: <ReceiptIcon />,
  },
];

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    DashboardService.getClienteDashboard()
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
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        menuItems={[
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
          { label: "Mi perfil", to: "/perfil" },
        ]}
        rightActions={[
          {
            label: "mi perfil",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/perfil"),
          },
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
            Mi Panel
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
              <Grid item xs={6} sm={4} md={3} key={card.key}>
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
          <Grid item xs={6} sm={4} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => navigate("/catalogo")}
            >
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 2 } }}>
                <StorefrontIcon
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    color: "#e5598f",
                    mb: 0.5,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Explorar
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Catálogo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                cursor: "pointer",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => navigate("/carrito")}
            >
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 2 } }}>
                <ShoppingCartIcon
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    color: "#e5598f",
                    mb: 0.5,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Mi
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Carrito
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1a1a2e",
            mb: 3,
            fontSize: { xs: "1.1rem", sm: "1.35rem" },
          }}
        >
          Mis Coreografías
        </Typography>

        {d.owned_choreographies && d.owned_choreographies.length > 0 ? (
          <Grid
            container
            spacing={{ xs: 2, sm: 3 }}
            sx={{ mb: { xs: 4, sm: 6 } }}
          >
            {d.owned_choreographies.map((ch) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ch.coreography_id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    height: "100%",
                    "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
                  }}
                  onClick={() => navigate(`/coreografias/${ch.coreography_id}`)}
                >
                  <div className="h-28 sm:h-36 bg-gradient-to-br from-pink-100 to-orange-100 rounded-t-xl flex items-center justify-center">
                    <LibraryMusicIcon
                      sx={{
                        fontSize: { xs: "2rem", sm: "3rem" },
                        color: "#e5598f",
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        mb: 1,
                      }}
                    >
                      {ch.c_name}
                    </Typography>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {ch.song_genre && (
                        <Chip
                          label={ch.song_genre}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            height: { xs: 22, sm: 28 },
                          }}
                        />
                      )}
                      <Chip
                        label={
                          difficultyLabels[ch.dificulty_level] ||
                          ch.dificulty_level
                        }
                        size="small"
                        color={
                          difficultyColors[ch.dificulty_level] || "default"
                        }
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          height: { xs: 22, sm: 28 },
                        }}
                      />
                    </div>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}
                    >
                      {ch.c_description && ch.c_description.length > 70
                        ? `${ch.c_description.substring(0, 70)}...`
                        : ch.c_description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              mb: 4,
              p: { xs: 2, sm: 4 },
              textAlign: "center",
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Aún no tienes coreografías adquiridas.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/coreografias")}
            >
              Explorar Catálogo
            </Button>
          </Card>
        )}

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1a1a2e",
            mb: 3,
            fontSize: { xs: "1.1rem", sm: "1.35rem" },
          }}
        >
          Compras Recientes
        </Typography>

        {d.recent_purchases && d.recent_purchases.length > 0 ? (
          <Grid container spacing={2}>
            {d.recent_purchases.slice(0, 5).map((p) => (
              <Grid item xs={12} key={p.purchase_id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.85rem", sm: "0.95rem" },
                          }}
                        >
                          Compra #{p.purchase_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.purchase_date
                            ? new Date(p.purchase_date).toLocaleDateString(
                                "es-CO",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Fecha no disponible"}
                        </Typography>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(p.items || []).map((item) => (
                            <Chip
                              key={item.coreography_id}
                              label={item.coreography_name}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                height: { xs: 22, sm: 28 },
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                            color: "#e5598f",
                          }}
                        >
                          ${Number(p.total_amount).toLocaleString("es-CO")}
                        </Typography>
                        {p.payment_method && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              textTransform: "uppercase",
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            }}
                          >
                            {p.payment_method}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: { xs: 2, sm: 4 },
              textAlign: "center",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No hay compras registradas.
            </Typography>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClienteDashboard;
