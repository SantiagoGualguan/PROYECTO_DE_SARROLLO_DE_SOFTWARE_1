import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import Footer from "../../components/layout/Footer/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import { SalesService } from "../../api/salesService";

// GET /api/sales/ no está documentado en el PDF, pero backend confirmó que
// responde igual que el endpoint documentado de historial
// (/api/users/clients/me/history/): un objeto paginado de DRF
// { count, next, previous, results: [...] }, no un arreglo plano.
// Este normalizador soporta ambas formas (por si algún día cambia a
// devolver un arreglo directo) para que la pantalla nunca truene.
const normalizePurchaseHistory = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

// Cada item de una compra puede venir anidado (item.coreography.coreography_id,
// item.coreography.c_name) o plano, como en el endpoint documentado del PDF
// (item.coreography_id, item.coreography_name). Este normalizador soporta
// ambas formas y SIEMPRE devuelve un id utilizable para la key de React y
// para la navegación — evita que un campo inesperado deje todos los Chips
// con key=undefined (que fue justo lo que causó el warning de keys duplicadas).
const normalizarItemCompra = (item, fallbackIndex) => {
  const coreographyId =
    item?.coreography?.coreography_id ?? item?.coreography_id ?? null;
  const coreographyName =
    item?.coreography?.c_name ?? item?.coreography_name ?? "Coreografía";
  return {
    key: item?.id ?? coreographyId ?? `sin-id-${fallbackIndex}`,
    coreographyId,
    coreographyName,
  };
};

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const successMsg = location.state?.success;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    SalesService.getPurchaseHistory()
      .then((res) => setPurchases(normalizePurchaseHistory(res.data)))
      .catch(() => setError("Error al cargar el historial"))
      .finally(() => setLoading(false));
  }, []);

  const irACoreografia = (coreographyId) => {
    if (!coreographyId) return;
    navigate(`/coreografias/${coreographyId}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        menuItems={[
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
          { label: "Mi perfil", to: "/perfil" },
          { label: "historial de compras", to: "/mi-historial-de-compras" },
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
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
            Mi historial de compras
          </Typography>
        </div>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {purchases.length === 0 ? (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              p: { xs: 3, sm: 6 },
              textAlign: "center",
            }}
          >
            <ReceiptIcon
              sx={{ fontSize: "4rem", color: "#e5598f", opacity: 0.4, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No tienes compras registradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Explora nuestro catálogo y adquiere tu primera coreografía.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {purchases.map((p) => (
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
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(p.items || []).map((item, idx) => {
                            const { key, coreographyId, coreographyName } =
                              normalizarItemCompra(
                                item,
                                `${p.purchase_id}-${idx}`,
                              );
                            return (
                              <Chip
                                key={key}
                                label={coreographyName}
                                size="small"
                                variant="outlined"
                                color="primary"
                                clickable={Boolean(coreographyId)}
                                onClick={() => irACoreografia(coreographyId)}
                                sx={{
                                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  height: { xs: 22, sm: 28 },
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        {p.bills?.[0] && (
                          <>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                                color: "#e5598f",
                              }}
                            >
                              $
                              {parseFloat(
                                p.bills[0].total_amount,
                              ).toLocaleString("es-CO")}
                            </Typography>
                            <Chip
                              label={
                                p.bills[0].payment_method === "pse"
                                  ? "PSE"
                                  : "Tarjeta"
                              }
                              size="small"
                              color={
                                p.bills[0].payment_method === "pse"
                                  ? "info"
                                  : "secondary"
                              }
                              sx={{
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                height: { xs: 22, sm: 28 },
                                mt: 0.5,
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PurchaseHistory;
