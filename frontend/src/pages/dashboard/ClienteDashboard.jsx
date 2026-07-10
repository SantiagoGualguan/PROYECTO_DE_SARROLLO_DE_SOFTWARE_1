import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
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

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getClienteDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-8">Cargando...</div>;
  if (!data) return <div className="flex justify-center p-8 text-red-500">Error al cargar dashboard</div>;

  const summaryCards = [
    { label: "Coreografías Adquiridas", value: data.purchased_choreographies_count, color: "text-purple-600" },
    { label: "Total Gastado", value: `$${Number(data.total_spent).toLocaleString("es-CO")}`, color: "text-green-600" },
    { label: "Compras Realizadas", value: data.purchase_count, color: "text-blue-600" },
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
          Mi Panel
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
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", cursor: "pointer", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => navigate("/coreografias")}
            >
              <CardContent>
                <Button variant="contained" color="primary" size="large" fullWidth>
                  Explorar Catálogo
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" className="mb-4" sx={{ fontWeight: 600, color: "#1a1a2e" }}>
          Mis Coreografías
        </Typography>

        {data.owned_choreographies && data.owned_choreographies.length > 0 ? (
          <Grid container spacing={3} className="mb-8">
            {data.owned_choreographies.map((ch) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ch.coreography_id}>
                <Card
                  sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", cursor: "pointer", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } }}
                  onClick={() => navigate(`/coreografias/${ch.coreography_id}`)}
                >
                  {ch.image_url && (
                    <div className="h-36 bg-cover bg-center rounded-t-xl" style={{ backgroundImage: `url(${ch.image_url})` }} />
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem", mb: 1 }}>
                      {ch.c_name}
                    </Typography>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {ch.song_genre && (
                        <Chip label={ch.song_genre} size="small" variant="outlined" />
                      )}
                      <Chip
                        label={difficultyLabels[ch.dificulty_level] || ch.dificulty_level}
                        size="small"
                        color={difficultyColors[ch.dificulty_level] || "default"}
                      />
                    </div>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                      {ch.c_description && ch.c_description.length > 80
                        ? `${ch.c_description.substring(0, 80)}...`
                        : ch.c_description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", mb: 8, p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Aún no tienes coreografías adquiridas.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate("/coreografias")}>
              Explorar Catálogo
            </Button>
          </Card>
        )}

        <Typography variant="h5" className="mb-4" sx={{ fontWeight: 600, color: "#1a1a2e" }}>
          Compras Recientes
        </Typography>

        {data.recent_purchases && data.recent_purchases.length > 0 ? (
          <Grid container spacing={2}>
            {data.recent_purchases.slice(0, 5).map((p) => (
              <Grid item xs={12} key={p.purchase_id}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Compra #{p.purchase_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {p.purchase_date ? new Date(p.purchase_date).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "Fecha no disponible"}
                        </Typography>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {(p.items || []).map((item) => (
                            <Chip key={item.coreography_id} label={item.coreography_name} size="small" variant="outlined" color="primary" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#e5598f" }}>
                          ${Number(p.total_amount).toLocaleString("es-CO")}
                        </Typography>
                        {p.payment_method && (
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No hay compras registradas.
            </Typography>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClienteDashboard;
