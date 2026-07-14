// src/components/ui/CoreografiaCard/CoreografiaCard.jsx
//
// Tarjeta que representa una coreografía en el catálogo.
// Al hacer clic navega a /coreografias/<coreography_id>.
//
// ─── Props ──────────────────────────────────────────────────────────────────
// coreografia  {object}  — objeto con la forma exacta que devuelve el backend:
//   {
//     coreography_id:  number
//     c_name:          string   — nombre de la coreografía
//     image_url:       string   — URL de la miniatura (puede ser null)
//     dificulty_level: "basic" | "intermediate" | "advanced"
//     song_genre:      string
//     price:           string   — "45000.00" (el backend devuelve Decimal como string)
//   }

import { useNavigate } from "react-router-dom";
import { Chip } from "@mui/material";
import "./CoreografiaCard.css";

// Etiquetas y colores MUI para cada nivel de dificultad
const NIVEL_CONFIG = {
  basic: { label: "Principiante", color: "success" },
  intermediate: { label: "Intermedio", color: "warning" },
  advanced: { label: "Avanzado", color: "error" },
};

// Formatea "45000.00" → "$45.000" en pesos colombianos
const formatearPrecio = (precio) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(precio));

const CoreografiaCard = ({ coreografia }) => {
  const navigate = useNavigate();
  const nivel = NIVEL_CONFIG[coreografia.dificulty_level] ?? NIVEL_CONFIG.basic;

  const handleClick = () => {
    // Lleva al usuario a DetalleCoreografia con el id en la URL.
    // DetalleCoreografia lo recupera con useParams().
    navigate(`/coreografias/${coreografia.coreography_id}`);
  };

  return (
    <div
      className="coreo-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Miniatura — usa image_url del backend */}
      <div className="coreo-card__thumb">
        {coreografia.image_url ? (
          <img
            src={coreografia.image_url}
            alt={coreografia.c_name}
            className="coreo-card__img"
          />
        ) : (
          // Fallback si no hay imagen cargada todavía
          <div className="coreo-card__img-placeholder" />
        )}

        {/* Chip de nivel flotante sobre la imagen */}
        <div className="coreo-card__chip">
          <Chip
            label={nivel.label}
            color={nivel.color}
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.6875rem" }}
          />
        </div>
      </div>

      {/* Cuerpo de la card */}
      <div className="coreo-card__body">
        <p className="coreo-card__title">{coreografia.c_name}</p>
        <p className="coreo-card__genre">{coreografia.song_genre}</p>
        <p className="coreo-card__price">
          {formatearPrecio(coreografia.price)}
        </p>
      </div>
    </div>
  );
};

export default CoreografiaCard;
