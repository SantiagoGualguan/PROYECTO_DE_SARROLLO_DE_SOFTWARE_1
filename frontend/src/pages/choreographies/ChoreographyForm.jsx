// src/pages/Coreografias/ChoreographyForm.jsx
//
// Formulario para que un profesor cree o edite una coreografía. Mismo
// esqueleto visual que UserForm.jsx (mismas clases de ChoreographyForm.css,
// que reutiliza las variables/estructura de userform-*.css).
//
// ── Cómo queda el flujo de videos (decidido con el usuario) ──────────────────
// - El trailer NO es un campo en la BD: es, por convención, el primer video
//   que se sube a la coreografía (el de upload_date más antiguo). No se tocó
//   el modelo. Esto tiene una limitación real: si el profesor quiere cambiar
//   cuál es el trailer más adelante, no hay forma de "reordenar" — tendría
//   que borrar el video actual y volver a subirlo primero. Lo dejamos así
//   porque fue la opción elegida, pero avisa si en algún momento quieres el
//   campo is_preview en video para poder reordenar sin trucos.
// - La sección de videos solo se habilita cuando coreografia YA tiene id:
//   -- en modo edición, apenas carga la coreografía.
//   -- en modo creación, después de guardar exitosamente el formulario base
//      (sin navegar a otra pantalla, para no perder el contexto).
//   Esto es obligatorio porque video.coreography_id es FK NOT NULL: no se
//   puede crear un video sin que la coreografía ya exista.
//
// ── Supuestos a verificar ────────────────────────────────────────────────────
// - Rutas esperadas: /profesor/coreografias/nueva (crear) y
//   /profesor/coreografias/:id/editar (editar). Ajusta si tu router usa
//   otros paths o param names.
// - profesor_id se toma del usuario logueado (useAuth) — se asume que quien
//   entra a este formulario ES el profesor (no un admin creando a nombre de
//   otro). Si un admin/director también debe poder crear coreografías para
//   un profesor distinto, hace falta un selector de profesor, y para eso
//   hace falta un endpoint que liste profesores (no vi uno en
//   choreographyService.js). Avísame si existe y lo agrego.
// - assistent_profesor_id se deja fuera del formulario por la misma razón:
//   no hay servicio para listar profesores y no quiero inventar un campo de
//   texto libre para un ID que en realidad es una FK.
// - song_genre es VARCHAR(50) libre en la BD (no tiene CHECK como
//   dificulty_level), así que lo dejo como texto libre con sugerencias de
//   los géneros que ya vi en tus datos de ejemplo, no como enum cerrado.

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  MenuItem,
  Autocomplete,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  CoreographyService,
  VideoService,
} from "../../api/choreographyService.js";
import "./ChoreographyForm.css";

const NIVELES = [
  { value: "basic", label: "Básico" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

const GENEROS_SUGERIDOS = [
  "salsa",
  "bachata",
  "hip_hop",
  "reggaeton",
  "merengue",
];

const FORM_VACIO = {
  c_name: "",
  image_url: "",
  c_description: "",
  dificulty_level: "",
  song_name: "",
  song_genre: "",
  price: "",
};

const normalizarCoreografia = (raw) => ({
  coreography_id: raw.coreography_id,
  c_name: raw.c_name ?? "",
  image_url: raw.image_url ?? "",
  c_description: raw.c_description ?? "",
  dificulty_level: raw.dificulty_level ?? "",
  song_name: raw.song_name ?? "",
  song_genre: raw.song_genre ?? "",
  price: raw.price != null ? String(raw.price) : "",
});

const normalizarVideo = (raw) => ({
  video_id: raw.video_id,
  video_name: raw.video_name ?? "",
  video_url: raw.video_url ?? "",
  upload_date: raw.upload_date,
});

const ChoreographyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esEdicion = Boolean(id);

  // ── Datos básicos de la coreografía ──
  const [form, setForm] = useState(FORM_VACIO);
  const [coreografiaId, setCoreografiaId] = useState(esEdicion ? id : null);
  const [cargandoCoreografia, setCargandoCoreografia] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ── Videos ──
  const [videos, setVideos] = useState([]);
  const [cargandoVideos, setCargandoVideos] = useState(false);
  const [videoForm, setVideoForm] = useState({ video_name: "", video_url: "" });
  const [agregandoVideo, setAgregandoVideo] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [errorVideo, setErrorVideo] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── Cargar coreografía existente (modo edición) ──
  useEffect(() => {
    if (!esEdicion) return;
    let cancelado = false;
    (async () => {
      setCargandoCoreografia(true);
      setError(null);
      try {
        const { data } = await CoreographyService.getById(id);
        if (!cancelado) setForm(normalizarCoreografia(data));
      } catch (err) {
        console.error("Error cargando la coreografía:", err);
        if (!cancelado) setError("No pudimos cargar esta coreografía.");
      } finally {
        if (!cancelado) setCargandoCoreografia(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [esEdicion, id]);

  // ── Cargar videos apenas hay coreografiaId (edición o recién creada) ──
  const cargarVideos = useCallback(async () => {
    if (!coreografiaId) return;
    setCargandoVideos(true);
    try {
      const { data } = await VideoService.getByCoreography(coreografiaId);
      const lista = Array.isArray(data) ? data : (data?.results ?? []);
      // Orden por fecha de subida: el más antiguo es el trailer.
      const ordenados = lista
        .map(normalizarVideo)
        .sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date));
      setVideos(ordenados);
    } catch (err) {
      console.error("Error cargando los videos de la coreografía:", err);
    } finally {
      setCargandoVideos(false);
    }
  }, [coreografiaId]);

  useEffect(() => {
    cargarVideos();
  }, [cargarVideos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);
    setGuardando(true);

    const payload = {
      c_name: form.c_name.trim(),
      image_url: form.image_url.trim() || null,
      c_description: form.c_description.trim() || null,
      dificulty_level: form.dificulty_level,
      song_name: form.song_name.trim() || null,
      song_genre: form.song_genre.trim() || null,
      price: Number(form.price),
      profesor: user?.id ?? null,
    };

    try {
      if (esEdicion) {
        await CoreographyService.update(coreografiaId, payload);
        setSuccess("Coreografía actualizada.");
      } else {
        const { data } = await CoreographyService.create(payload);
        setCoreografiaId(data.coreography_id);
        setSuccess("Coreografía creada. Ya puedes agregar videos abajo.");
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError("Error al guardar la coreografía. Intenta de nuevo.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setVideoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarVideo = async () => {
    setErrorVideo(null);
    setAgregandoVideo(true);
    try {
      await VideoService.create({
        video_name: videoForm.video_name.trim(),
        video_url: videoForm.video_url.trim(),
        coreography_id: coreografiaId,
      });
      setVideoForm({ video_name: "", video_url: "" });
      await cargarVideos();
    } catch (err) {
      const data = err.response?.data;
      setErrorVideo(
        data?.detail ||
          "No pudimos agregar el video. Revisa la URL e intenta de nuevo.",
      );
    } finally {
      setAgregandoVideo(false);
    }
  };

  const handleEliminarVideo = async (videoId) => {
    if (
      !window.confirm("¿Eliminar este video? Esta acción no se puede deshacer.")
    )
      return;
    setEliminandoId(videoId);
    try {
      await VideoService.delete(videoId);
      setVideos((prev) => prev.filter((v) => v.video_id !== videoId));
    } catch (err) {
      console.error("Error eliminando el video:", err);
      setErrorVideo("No pudimos eliminar el video. Intenta de nuevo.");
    } finally {
      setEliminandoId(null);
    }
  };

  const isFormValid =
    form.c_name.trim() &&
    form.dificulty_level &&
    form.price !== "" &&
    Number(form.price) >= 0;

  const isVideoFormValid =
    videoForm.video_name.trim() && videoForm.video_url.trim();

  if (cargandoCoreografia) {
    return (
      <div className="choreographyform-loading">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Dashboard", to: "/dashboard" },
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
      <div className="container userform-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* ── Encabezado ── */}
            <div className="userform-header">
              <h1 className="userform-title">
                {esEdicion ? "Editar coreografía" : "Crear coreografía"}
              </h1>
              <p className="userform-subtitle">
                {esEdicion
                  ? "Actualiza la información y los videos de tu coreografía"
                  : "Completa los datos básicos; podrás agregar videos al guardar"}
              </p>
            </div>

            {/* ── Formulario básico ── */}
            <div className="userform-form">
              <TextField
                label="Nombre de la coreografía"
                variant="outlined"
                fullWidth
                name="c_name"
                value={form.c_name}
                onChange={handleChange}
              />
              <TextField
                label="URL de la imagen de portada"
                variant="outlined"
                fullWidth
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
              />
              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                name="c_description"
                value={form.c_description}
                onChange={handleChange}
              />
              <TextField
                label="Nivel de dificultad"
                variant="outlined"
                fullWidth
                select
                name="dificulty_level"
                value={form.dificulty_level}
                onChange={handleChange}
              >
                {NIVELES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Nombre de la canción"
                variant="outlined"
                fullWidth
                name="song_name"
                value={form.song_name}
                onChange={handleChange}
              />
              <Autocomplete
                freeSolo
                options={GENEROS_SUGERIDOS}
                inputValue={form.song_genre}
                onInputChange={(_, value) =>
                  setForm((prev) => ({ ...prev, song_genre: value }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Género musical"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
              <TextField
                label="Precio (COP)"
                variant="outlined"
                fullWidth
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              />

              {success && (
                <p style={{ color: "green", fontSize: "0.875rem" }}>
                  {success}
                </p>
              )}
              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>
              )}

              {/* ── Botones ── */}
              <div className="userform-actions">
                <Button
                  label="CANCELAR"
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/profesor/coreografias")}
                />
                <Button
                  label={
                    guardando
                      ? "Guardando..."
                      : esEdicion
                        ? "Guardar cambios"
                        : "Crear coreografía"
                  }
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!isFormValid || guardando}
                  onClick={handleSubmit}
                />
              </div>
            </div>

            {/* ── Videos: solo visible cuando ya existe coreografiaId ── */}
            {coreografiaId && (
              <div className="choreographyform-videosection">
                <div className="userform-header">
                  <h2
                    className="userform-title"
                    style={{ fontSize: "var(--font-size-md)" }}
                  >
                    Videos
                  </h2>
                  <p className="userform-subtitle">
                    El primer video que agregues queda como trailer público. Los
                    demás se desbloquean cuando el usuario compra la
                    coreografía.
                  </p>
                </div>

                {cargandoVideos ? (
                  <div className="choreographyform-loading">
                    <CircularProgress size={24} />
                  </div>
                ) : (
                  <div className="choreographyform-videolist">
                    {videos.length === 0 && (
                      <p className="userform-subtitle">
                        Todavía no hay videos.
                      </p>
                    )}
                    {videos.map((v, index) => (
                      <div
                        key={v.video_id}
                        className="choreographyform-videoitem"
                      >
                        <div className="choreographyform-videoinfo">
                          {index === 0 ? (
                            <Chip
                              icon={<PlayCircleIcon />}
                              label="Trailer · público"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={<LockOutlinedIcon />}
                              label="Se desbloquea al comprar"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <span className="choreographyform-videoname">
                            {v.video_name}
                          </span>
                        </div>
                        <IconButton
                          size="small"
                          disabled={eliminandoId === v.video_id}
                          onClick={() => handleEliminarVideo(v.video_id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Agregar video ── */}
                <div className="choreographyform-addvideo">
                  <TextField
                    label="Nombre del video"
                    variant="outlined"
                    fullWidth
                    size="small"
                    name="video_name"
                    value={videoForm.video_name}
                    onChange={handleVideoChange}
                  />
                  <TextField
                    label="URL del video (embed)"
                    variant="outlined"
                    fullWidth
                    size="small"
                    name="video_url"
                    value={videoForm.video_url}
                    onChange={handleVideoChange}
                  />
                  {errorVideo && (
                    <p style={{ color: "red", fontSize: "0.875rem" }}>
                      {errorVideo}
                    </p>
                  )}
                  <Button
                    label={agregandoVideo ? "Agregando..." : "Agregar video"}
                    variant="outlined"
                    color="primary"
                    size="medium"
                    disabled={!isVideoFormValid || agregandoVideo}
                    onClick={handleAgregarVideo}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoreographyForm;
