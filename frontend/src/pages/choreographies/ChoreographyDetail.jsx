// src/pages/ChoreographyDetail/ChoreographyDetail.jsx
//
// Página de detalle de una coreografía.
// Recibe el :id desde la URL y busca la coreografía en el mock.
// Cuando conectes el backend, reemplaza el .find() por un useEffect
// que llame a CoreografiaService.obtener(id).

import { useParams, useNavigate } from "react-router-dom";
import { coreografiasMock } from "../../components/common/CoreografiasMock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { Chip } from "@mui/material";
import "./ChoreographyDetail.css";

// ── helpers ───────────────────────────────────────────────────────────────────

// Usa Chip de MUI igual que CoreografiaCard para consistencia visual
const NIVEL = {
  basic: { label: "Principiante", color: "success" },
  intermediate: { label: "Intermedio", color: "warning" },
  advanced: { label: "Avanzado", color: "error" },
};

const formatPrecio = (precio) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(precio));

// Videos mock — cuando haya backend se reemplaza por:
// CoreografiaService.listarVideos(id) → GET /api/videos/?coreography=<id>
const VIDEO_MOCK = [
  { id: 1, video_name: "Calentamiento y preparación" },
  { id: 2, video_name: "Sección A — pasos base" },
  { id: 3, video_name: "Sección B — giros y saltos" },
  { id: 4, video_name: "Rutina completa" },
];

// ── componente ────────────────────────────────────────────────────────────────

const ChoreographyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Busca la coreografía por id en el mock.
  // Con backend: const [coreo, setCoreo] = useState(null) + useEffect con fetch
  const coreo = coreografiasMock.find(
    (c) => c.coreography_id === Number(id) && c.status === "active",
  );

  // Estado de error: coreografía no encontrada
  if (!coreo) {
    return (
      <div className="container choreography-detail-container text-center">
        <p className="mb-3 text-muted">Coreografía no encontrada.</p>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/coreografias")}
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const nivel = NIVEL[coreo.dificulty_level] ?? NIVEL.basic;

  // Mientras no haya endpoint de profesores, construimos el nombre así.
  // Con backend: viene del serializer anidado o de un fetch separado.
  const profesorNombre = `Profesor ${coreo.profesor_id}`;

  return (
    <div className="container choreography-detail-container">
      {/* Botón volver */}
      <div className="choreography-detail-back">
        <button
          className="btn btn-link choreography-detail-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon fontSize="small" />
          Volver
        </button>
      </div>

      {/* Layout principal: trailer (7 cols) | info (5 cols) */}
      <div className="row gy-4 align-items-start">
        {/* ── Columna izquierda: trailer ── */}
        <div className="col-12 col-lg-7">
          <div className="choreography-detail-trailer">
            <img src={coreo.image_url} alt={coreo.c_name} />
            <span className="choreography-detail-tag">Trailer</span>
            {/*
              Botón de play: cuando tengas trailer_url conecta aquí ReactPlayer:
              import ReactPlayer from "react-player"
              <ReactPlayer url={coreo.trailer_url} controls width="100%" height="100%" />
            */}
            <div className="choreography-detail-play">
              <PlayArrowIcon />
            </div>
          </div>
        </div>

        {/* ── Columna derecha: información ── */}
        <div className="col-12 col-lg-5">
          <div className="choreography-detail-info">
            {/* Nombre + badge de nivel */}
            <div className="choreography-detail-info-header">
              <h1 className="choreography-detail-title">{coreo.c_name}</h1>
              {/*
                Chip de MUI igual que en CoreografiaCard para que el color
                del nivel sea consistente en toda la app.
              */}
              <Chip
                label={nivel.label}
                color={nivel.color}
                size="small"
                sx={{ fontWeight: 700, flexShrink: 0 }}
              />
            </div>

            {/* Profesor en la esquina superior derecha (como en el mockup) */}
            <div className="choreography-detail-professor-top">
              <div className="choreography-detail-professor-avatar">
                {profesorNombre.charAt(0)}
              </div>
              <span className="choreography-detail-professor-name">
                {profesorNombre}
              </span>
            </div>

            {/* Colección */}
            <p className="choreography-detail-meta">
              Colección de {VIDEO_MOCK.length} videos
            </p>

            {/* Precio */}
            <p className="choreography-detail-price">
              {formatPrecio(coreo.price)}
            </p>

            {/* Datos tabulados */}
            <div className="choreography-detail-data">
              {[
                { label: "Descripción", value: coreo.c_description },
                { label: "Profesor", value: profesorNombre },
                { label: "Género", value: coreo.song_genre },
                { label: "Modalidad", value: "En línea" },
                { label: "Nivel", value: nivel.label },
                { label: "Canción", value: coreo.song_name },
              ].map((item) => (
                <div className="choreography-detail-data-item" key={item.label}>
                  <span className="choreography-detail-data-label">
                    {item.label}:
                  </span>
                  <span className="choreography-detail-data-value">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="choreography-detail-actions">
              <button
                className="btn choreography-btn-primary btn-lg"
                type="button"
                onClick={() => alert("Redirigir a checkout")}
              >
                Comprar ahora
              </button>
              <button
                className="btn choreography-btn-outline btn-lg"
                type="button"
                onClick={() => alert("Añadido al carrito")}
              >
                <ShoppingCartIcon fontSize="small" />
                Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sección de videos ── */}
      <div className="choreography-detail-videos">
        <h2 className="choreography-detail-videos-title">
          Videos ({VIDEO_MOCK.length})
        </h2>

        {/*
          Grid responsivo: 1 col móvil → 2 cols sm → 3 cols md → 4 cols xl.
          Los videos reales vendrán de CoreografiaService.listarVideos(id)
          que llama a GET /api/videos/?coreography=<id>
          El campo del backend se llama video_name (no titulo).
        */}
        <div className="row g-3">
          {VIDEO_MOCK.map((video) => (
            <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={video.id}>
              <div className="choreography-video-card">
                <div className="choreography-video-thumb">
                  <MusicNoteIcon />
                </div>
                <p className="choreography-video-title">{video.video_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoreographyDetail;
