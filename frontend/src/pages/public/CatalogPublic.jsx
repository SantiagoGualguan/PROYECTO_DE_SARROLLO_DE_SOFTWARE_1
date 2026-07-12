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
import Snackbar from "@mui/material/Snackbar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import apiClient from "../../api/axios";

const difficultyColors = { basic: "success", intermediate: "warning", advanced: "error" };
const difficultyLabels = { basic: "Básico", intermediate: "Intermedio", advanced: "Avanzado" };

const CatalogPublic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [coreographies, setCoreographies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "" });

  const isClient = user?.role === "client";

  useEffect(() => {
    apiClient.get("/choreographies/")
      .then((res) => setCoreographies(res.data))
      .catch(() => setError("Error al cargar el catálogo"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (coreographyId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingId(coreographyId);
    try {
      await addItem(coreographyId);
      setSnack({ open: true, message: "Agregado al carrito" });
    } catch {
      setSnack({ open: true, message: "Error al agregar al carrito" });
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMenu={false} showFullLogo={true} showSearch={false}
        rightActions={
          user
            ? [{ label: "mi perfil", variant: "contained", color: "primary", onClick: () => navigate("/perfil") }]
            : [{ label: "iniciar sesión", variant: "contained", color: "primary", onClick: () => navigate("/login") }]
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Catálogo de Coreografías
          </Typography>
        </div>

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        {coreographies.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">No hay coreografías disponibles</Typography>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {coreographies.map((ch) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ch.coreography_id}>
                <Card
                  sx={{
                    borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    cursor: "pointer", height: "100%", display: "flex", flexDirection: "column",
                    "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
                  }}
                  onClick={() => {}}
                >
                  <div className="h-28 sm:h-36 bg-gradient-to-br from-pink-100 to-orange-100 rounded-t-xl flex items-center justify-center">
                    {ch.image_url ? (
                      <img src={ch.image_url} alt={ch.c_name} className="w-full h-full object-cover rounded-t-xl" />
                    ) : (
                      <LibraryMusicIcon sx={{ fontSize: { xs: "2rem", sm: "3rem" }, color: "#e5598f", opacity: 0.6 }} />
                    )}
                  </div>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 1 }}>
                      {ch.c_name}
                    </Typography>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {ch.song_genre && (
                        <Chip label={ch.song_genre} size="small" variant="outlined"
                          sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, height: { xs: 22, sm: 28 } }} />
                      )}
                      <Chip label={difficultyLabels[ch.dificulty_level] || ch.dificulty_level} size="small"
                        color={difficultyColors[ch.dificulty_level] || "default"}
                        sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, height: { xs: 22, sm: 28 } }} />
                    </div>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" }, mb: 1, flex: 1 }}>
                      {ch.c_description && ch.c_description.length > 80 ? `${ch.c_description.substring(0, 80)}...` : ch.c_description}
                    </Typography>
                    <div className="flex items-center justify-between mt-auto">
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#e5598f", fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>
                        ${parseFloat(ch.price || 0).toLocaleString("es-CO")}
                      </Typography>
                      {isClient && (
                        <Button
                          variant="contained" size="small" color="primary"
                          startIcon={<ShoppingCartIcon />}
                          disabled={addingId === ch.coreography_id}
                          onClick={(e) => handleAddToCart(ch.coreography_id, e)}
                          sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" }, minWidth: "auto" }}
                        >
                          {addingId === ch.coreography_id ? "..." : "Agregar"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        message={snack.message}
        action={
          <Button color="secondary" size="small" onClick={() => { setSnack({ ...snack, open: false }); navigate("/carrito"); }}>
            Ver Carrito
          </Button>
        }
      />
    </div>
  );
};

export default CatalogPublic;
