// src/pages/Coreografias/CoreografiaDetail.jsx
//
// Página de detalle de una coreografía — GET /api/choreographies/:id/ +
// GET /api/videos/?coreography=:id.
//
// Misma lógica comercial de siempre (useCart, redirect a login, botón solo
// para clientes, Snackbar), con layout partido en dos columnas en desktop.
//
// ── Control de acceso a videos (nuevo) ──────────────────────────────────────
// El primer video (por video_id, orden de subida) es el trailer y lo puede
// reproducir cualquiera. Los videos restantes solo se reproducen si el
// usuario autenticado ya compró esta coreografía. Eso se valida contra
// GET /api/sales/ (SalesService.getPurchaseHistory), buscando la coreografía
// actual dentro de purchase.items[].coreography.coreography_id — mismo campo
// que ya usa PurchaseHistory.jsx para listar los chips de cada compra.
//
// ⚠️ IMPORTANTE — esto es solo un bloqueo de UI, no seguridad real:
// GET /api/videos/?coreography=:id es PÚBLICO (AllowAny) y ya devuelve la
// video_url completa de TODOS los videos, compilados o no. Cualquiera que
// abra la pestaña de Red del navegador puede copiar esa URL directamente,
// sin pasar por este componente. Si video_url apunta a un archivo servido
// directo (no un stream firmado/tokenizado), esto no evita la descarga o
// reproducción por fuera de la app. Para bloquear de verdad hace falta que
// el backend NO devuelva video_url de los videos no comprados (o devuelva
// una URL firmada de corta duración) cuando el usuario no tiene acceso.
// Coméntalo con el equipo de backend si este componente necesita ser la
// única barrera.
//
// ── Supuestos a verificar ────────────────────────────────────────────────────
// - Ruta esperada: /coreografias/:id (ajusta el nombre del param si tu router
//   usa otro, ej. :coreografiaId).
// - Rutas de import a 3 niveles ("../../../..."), igual que la versión corta
//   que me pasaste. Ajusta si tu archivo vive en otra profundidad.
// - "Primer video" = video_id más bajo entre los videos de la coreografía
//   (se ordenan explícitamente por video_id ascendente antes de elegir el
//   trailer, para no depender del orden en que responda el backend).
// - El chequeo de compra solo se hace si hay usuario autenticado con
//   role === "client" (mismo criterio que ya usa el botón de compra). Otros
//   roles (admin/profesor/director) NO desbloquean videos automáticamente;
//   si tu flujo real quiere que profesores vean todo, avísame y lo ajusto.
// - GET /api/sales/ no está documentado en el PDF de endpoints (ese doc solo
//   describe /api/users/clients/me/history/), así que me guie por cómo lo
//   consume PurchaseHistory.jsx: res.data es el arreglo de compras y cada
//   compra trae items: [{ coreography: { coreography_id, c_name, ... } }].

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BoltIcon from "@mui/icons-material/Bolt";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  CoreographyService,
  VideoService,
} from "../../api/choreographyService";
import { SalesService } from "../../api/salesService";

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

// Mismo adaptador que Coreografias.jsx — nombres ya confirmados del DDL,
// sin adivinar variantes en español.
const normalizarCoreografia = (raw) => ({
  coreography_id: raw.coreography_id,
  c_name: raw.c_name ?? "",
  image_url: raw.image_url ?? "",
  c_description: raw.c_description ?? "",
  dificulty_level: raw.dificulty_level ?? null,
  song_name: raw.song_name ?? "",
  song_genre: raw.song_genre ?? null,
  price: Number(raw.price ?? 0),
  times_sold: Number(raw.times_sold ?? 0),
  profesor_id: raw.profesor_id ?? raw.profesor ?? null,
  status: raw.status ?? "active",
});

const normalizarVideo = (raw) => ({
  video_id: raw.video_id,
  video_name: raw.video_name ?? "",
  video_url: raw.video_url ?? "",
  upload_date: raw.upload_date,
});

const normalizePurchaseHistory = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

// Recorre el historial de compras y busca si `coreographyId` aparece en
// alguno de los items de alguna compra. Compara como string porque el id de
// la URL (useParams) siempre llega como string y coreography_id del backend
// puede llegar como number.
const buscarCompraDeCoreografia = (purchases, coreographyId) =>
  purchases.some((p) =>
    (p.items || []).some(
      (item) =>
        String(item?.coreography?.coreography_id) === String(coreographyId),
    ),
  );

const CoreografiaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [coreografia, setCoreografia] = useState(null);
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const [agregando, setAgregando] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "" });

  const isClient = user?.role === "client";

  // Orden estable por video_id ascendente: el "primer video" (trailer) es
  // siempre el de menor id, sin depender del orden de la respuesta del API.
  const videosOrdenados = [...videos].sort((a, b) => a.video_id - b.video_id);
  const trailer = videosOrdenados[0] ?? null;
  const videosSecundarios = videosOrdenados.slice(1);

  const cargarDetalle = useCallback(async () => {
    setCargando(true);
    setError(null);
    setCoreografia(null);
    setVideos([]);

    try {
      const resCoreografia = await CoreographyService.getById(id);
      setCoreografia(normalizarCoreografia(resCoreografia.data));
    } catch (err) {
      console.error("Error cargando el detalle de la coreografía:", err);
      if (err.response?.status === 404) {
        setError("Esta coreografía no existe o ya no está disponible.");
      } else {
        setError("No pudimos cargar esta coreografía. Intenta de nuevo.");
      }
      setCargando(false);
      return;
    }

    try {
      const resVideos = await VideoService.getByCoreography(id);
      const listaVideos = Array.isArray(resVideos.data)
        ? resVideos.data
        : (resVideos.data?.results ?? []);
      setVideos(listaVideos.map(normalizarVideo));
    } catch (err) {
      console.warn("No se pudieron cargar los videos de la coreografía:", err);
      setVideos([]);
    } finally {
      setCargando(false);
    }
  }, [id]);

  // Verifica si el usuario (cliente autenticado) ya compró esta coreografía,
  // para decidir si desbloquea los videos secundarios.
  const cargarEstadoCompra = useCallback(async () => {
    if (!user || !isClient) {
      setHasPurchased(false);
      setPurchaseLoading(false);
      return;
    }

    setPurchaseLoading(true);
    try {
      const res = await SalesService.getPurchaseHistory();
      const purchases = normalizePurchaseHistory(res.data);
      setHasPurchased(buscarCompraDeCoreografia(purchases, id));
    } catch (err) {
      console.warn("No se pudo verificar el historial de compras:", err);
      // Ante la duda, no desbloquear.
      setHasPurchased(false);
    } finally {
      setPurchaseLoading(false);
    }
  }, [user, isClient, id]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  useEffect(() => {
    cargarEstadoCompra();
  }, [cargarEstadoCompra]);

  const handleAgregarAlCarrito = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAgregando(true);
    try {
      await addItem(coreografia.coreography_id);
      setSnack({ open: true, message: "Agregado al carrito" });
    } catch {
      setSnack({ open: true, message: "Error al agregar al carrito" });
    } finally {
      setAgregando(false);
    }
  };

  const handleComprarAhora = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setComprando(true);
    try {
      await addItem(coreografia.coreography_id);
      navigate("/checkout");
    } catch {
      setSnack({ open: true, message: "Error al procesar la compra" });
      setComprando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !coreografia) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showMenu={false} showFullLogo={true} showSearch={false} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "No encontramos esta coreografía."}
          </Alert>
          <Button variant="outlined" onClick={() => navigate("/coreografias")}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        rightActions={
          user
            ? [
                {
                  label: "mi perfil",
                  variant: "contained",
                  color: "primary",
                  onClick: () => navigate("/perfil"),
                },
              ]
            : [
                {
                  label: "iniciar sesión",
                  variant: "contained",
                  color: "primary",
                  onClick: () => navigate("/login"),
                },
              ]
        }
      />

      {/* Barra de volver, fuera de la columna de contenido para que no quede
          atrapada dentro del ancho angosto */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-7xl mx-auto">
        <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
          <ArrowBackIcon />
        </IconButton>
      </div>

      {/* Layout partido: contenido a la izquierda, compra a la derecha.
          En mobile se apila y la tarjeta de compra va primero. */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Columna de compra (sticky en desktop) ── */}
        <div
          className="order-1 lg:order-2 lg:col-span-1 lg:sticky lg:top-6"
          id="tarjeta-compra"
        >
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <div className="flex gap-1 flex-wrap mb-2">
                <Chip
                  label={
                    difficultyLabels[coreografia.dificulty_level] ||
                    coreografia.dificulty_level
                  }
                  size="small"
                  color={
                    difficultyColors[coreografia.dificulty_level] || "default"
                  }
                />
                {coreografia.song_genre && (
                  <Chip
                    label={coreografia.song_genre}
                    size="small"
                    variant="outlined"
                  />
                )}
              </div>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a2e",
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {coreografia.c_name}
              </Typography>

              {coreografia.song_name && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  🎵 {coreografia.song_name}
                </Typography>
              )}

              {coreografia.times_sold > 0 && (
                <div className="flex items-center gap-1 mb-2 text-gray-500">
                  <LocalFireDepartmentIcon sx={{ fontSize: "1rem" }} />
                  <Typography variant="caption">
                    {coreografia.times_sold}{" "}
                    {coreografia.times_sold === 1 ? "compra" : "compras"}
                  </Typography>
                </div>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#e5598f", mb: 2 }}
              >
                ${coreografia.price.toLocaleString("es-CO")}
              </Typography>

              {isClient && !hasPurchased && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<BoltIcon />}
                    disabled={agregando || comprando}
                    onClick={handleComprarAhora}
                  >
                    {comprando ? "Procesando..." : "Comprar ahora"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    disabled={agregando || comprando}
                    onClick={handleAgregarAlCarrito}
                  >
                    {agregando ? "Agregando..." : "Agregar al carrito"}
                  </Button>
                </div>
              )}

              {isClient && hasPurchased && (
                <Alert severity="success" icon={false} sx={{ py: 0.5 }}>
                  Ya tienes acceso a esta coreografía
                </Alert>
              )}

              {!user && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/login")}
                >
                  Inicia sesión para comprar
                </Button>
              )}

              {coreografia.c_description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {coreografia.c_description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Columna de contenido: imagen + videos ── */}
        <div className="order-2 lg:order-1 lg:col-span-2 flex flex-col gap-6">
          <div className="h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            {trailer ? (
              <iframe
                src={trailer.video_url}
                title={trailer.video_name}
                className="w-full h-full"
                allowFullScreen
              />
            ) : coreografia.image_url ? (
              <img
                src={coreografia.image_url}
                alt={coreografia.c_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <LibraryMusicIcon
                sx={{ fontSize: "4rem", color: "#e5598f", opacity: 0.6 }}
              />
            )}
          </div>

          <div>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Videos
            </Typography>

            {videosSecundarios.length === 0 ? (
              <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Todavía no hay videos cargados para esta coreografía.
                </Typography>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videosSecundarios.map((v) => (
                  <Card
                    key={v.video_id}
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div className="aspect-video w-full bg-black">
                      {purchaseLoading ? (
                        // Mientras se verifica la compra evitamos mostrar el
                        // video "desbloqueado" un instante y luego bloquearlo
                        // (flash). Placeholder neutro mientras tanto.
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-400 border-t-transparent" />
                        </div>
                      ) : hasPurchased ? (
                        <iframe
                          src={v.video_url}
                          title={v.video_name}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white px-4 text-center">
                          <LockIcon sx={{ fontSize: "2rem", opacity: 0.8 }} />
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {user
                              ? "Compra esta coreografía para ver este video"
                              : "Inicia sesión y compra esta coreografía para verlo"}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "white",
                              borderColor: "rgba(255,255,255,0.5)",
                              mt: 0.5,
                            }}
                            onClick={() => {
                              if (!user) {
                                navigate("/login");
                                return;
                              }
                              document
                                .getElementById("tarjeta-compra")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            {user ? "Ver precio" : "Iniciar sesión"}
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600 }}
                        className="flex items-center gap-1"
                      >
                        {!purchaseLoading && !hasPurchased && (
                          <LockIcon sx={{ fontSize: "1rem", opacity: 0.6 }} />
                        )}
                        {v.video_name}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        message={snack.message}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => {
              setSnack({ ...snack, open: false });
              navigate("/carrito");
            }}
          >
            Ver Carrito
          </Button>
        }
      />
    </div>
  );
};

export default CoreografiaDetail;
