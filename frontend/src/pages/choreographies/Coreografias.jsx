// src/pages/Coreografias/Coreografias.jsx
//
// Página principal del catálogo de coreografías.
//
// ── Dos modos de vista ────────────────────────────────────────────────────────
//
//  1. MODO SECCIONES (por defecto)
//     Muestra carruseles agrupados: Recientes, Populares, y uno por nivel.
//     Es la vista del mockup.
//
//  2. MODO GRILLA
//     Se activa cuando el usuario escribe en el buscador O aplica algún filtro.
//     Muestra todas las coincidencias en una grilla responsiva.
//
// ── Cómo funcionan los filtros ───────────────────────────────────────────────
//
//  Los filtros son tres campos de estado (nivel, genero, profesor) que se
//  pasan a filtrarCoreografias() de coreografiasMock.js.
//  Esa función hace un .filter() sobre el array. Cuando conectes el backend
//  esos mismos valores se convierten en query params:
//    GET /api/choreographies/?dificulty_level=basic&song_genre=salsa
//  y el backend (CoreographyFilter de django-filters) los procesa.
//
//  El panel de filtros se abre/cierra con el botón "Filtro" (como en el mockup).
//  Los tres filtros y el buscador son independientes y se pueden combinar.
//  "Limpiar" resetea todo y vuelve al modo secciones.

import { useState, useMemo } from "react";
import { TextField, InputAdornment, Chip, Collapse } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import CoreografiaCarrusel from "../../components/common/CoreografiaCarrusel";
import CoreografiaCard from "../../components/common/CoreografiaCard";
import {
  coreografiasMock,
  filtrarCoreografias,
} from "../../components/common/CoreografiasMock";
import "./Coreografias.css";

// ── Opciones de los filtros ───────────────────────────────────────────────────
// Cuando conectes el backend estos valores pueden venir de endpoints como:
//   GET /api/genres/     → géneros únicos
//   GET /api/profesores/ → lista de profesores
// Por ahora los calculamos desde el mock para no hardcodearlos.

const NIVELES = [
  { value: "basic", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

// Extrae géneros únicos del mock (con backend: fetch a /api/genres/)
const GENEROS = [...new Set(coreografiasMock.map((c) => c.song_genre))].sort();

// Extrae profesores únicos del mock (con backend: fetch a /api/profesores/)
// Como el mock usa profesor_id, simulamos los nombres
const PROFESORES_MOCK = [
  { id: 1, nombre: "Valentina Ríos" },
  { id: 2, nombre: "Andrés Molina" },
  { id: 3, nombre: "Sebastián Cruz" },
];

// ── Secciones de los carruseles ───────────────────────────────────────────────
const construirSecciones = (lista) => [
  {
    key: "recientes",
    titulo: "Recientes",
    items: [...lista]
      .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
      .slice(0, 8),
  },
  {
    key: "populares",
    titulo: "Populares",
    items: [...lista].sort((a, b) => b.times_sold - a.times_sold).slice(0, 8),
  },
  {
    key: "basic",
    titulo: "Nivel Principiante",
    items: lista.filter((c) => c.dificulty_level === "basic"),
  },
  {
    key: "intermediate",
    titulo: "Nivel Intermedio",
    items: lista.filter((c) => c.dificulty_level === "intermediate"),
  },
  {
    key: "advanced",
    titulo: "Nivel Avanzado",
    items: lista.filter((c) => c.dificulty_level === "advanced"),
  },
];

// ── Componente ────────────────────────────────────────────────────────────────

const Coreografias = () => {
  // ── Estado del buscador ──────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");

  // ── Estado del panel de filtros ──────────────────────────────────────────
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // ── Estado de los tres filtros ───────────────────────────────────────────
  // Cada uno es null cuando no está activo, o el valor seleccionado.
  const [filtros, setFiltros] = useState({
    nivel: null, // "basic" | "intermediate" | "advanced"
    genero: null, // string del song_genre
    profesor: null, // number del profesor_id
  });

  // ── ¿Hay algún filtro o búsqueda activa? ─────────────────────────────────
  // Si sí → modo grilla. Si no → modo secciones.
  const hayFiltrosActivos =
    busqueda.trim().length > 1 ||
    Object.values(filtros).some((v) => v !== null);

  // Cuenta cuántos filtros están activos para el badge del botón
  const cantidadFiltros = Object.values(filtros).filter(
    (v) => v !== null,
  ).length;

  // ── Resultados filtrados ─────────────────────────────────────────────────
  // useMemo evita recalcular en cada render si no cambiaron los filtros.
  // filtrarCoreografias() está en coreografiasMock.js y recibe el mismo
  // objeto de parámetros que se enviaría como query params al backend.
  const resultados = useMemo(() => {
    if (!hayFiltrosActivos) return [];
    return filtrarCoreografias({
      busqueda: busqueda.trim().length > 1 ? busqueda : undefined,
      nivel: filtros.nivel ?? undefined,
      genero: filtros.genero ?? undefined,
      // Pasamos profesor_id para que filtrarCoreografias() filtre por él
      // Con backend: el query param sería ?profesor_id=1
      profesorId: filtros.profesor ?? undefined,
    });
  }, [busqueda, filtros, hayFiltrosActivos]);

  // ── Secciones para el modo carruseles ────────────────────────────────────
  const secciones = useMemo(
    () =>
      construirSecciones(coreografiasMock.filter((c) => c.status === "active")),
    [],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBusqueda = (e) => setBusqueda(e.target.value);

  // Alterna un valor de filtro: si ya estaba seleccionado lo quita (toggle)
  const toggleFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: prev[campo] === valor ? null : valor,
    }));
  };

  const limpiarTodo = () => {
    setBusqueda("");
    setFiltros({ nivel: null, genero: null, profesor: null });
    setFiltrosAbiertos(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="coreografias-page">
      <div className="container">
        {/* ── Barra de búsqueda + botón filtro ── */}
        <div className="coreografias-topbar">
          <TextField
            placeholder="¿Qué quieres aprender?"
            value={busqueda}
            onChange={handleBusqueda}
            size="small"
            fullWidth
            className="coreografias-search"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: busqueda && (
                  <InputAdornment position="end">
                    <CloseIcon
                      fontSize="small"
                      className="coreografias-search-clear"
                      onClick={() => setBusqueda("")}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Botón Filtro — abre/cierra el panel */}
          <button
            className={`btn coreografias-filter-btn ${filtrosAbiertos ? "coreografias-filter-btn--active" : ""}`}
            onClick={() => setFiltrosAbiertos((prev) => !prev)}
          >
            <TuneIcon fontSize="small" />
            Filtro
            {/* Badge con el número de filtros activos */}
            {cantidadFiltros > 0 && (
              <span className="coreografias-filter-badge">
                {cantidadFiltros}
              </span>
            )}
          </button>
        </div>

        {/* ── Panel de filtros (se abre/cierra con Collapse de MUI) ── */}
        {/*
          Collapse anima la apertura y cierre del panel.
          Dentro hay tres grupos de chips: Nivel, Género y Profesor.
          Cada chip hace toggle del filtro correspondiente.
          Al seleccionar uno se pinta de color primario (igual que en el mockup).
        */}
        <Collapse in={filtrosAbiertos}>
          <div className="coreografias-filters-panel">
            {/* Grupo: Nivel */}
            <div className="coreografias-filter-group">
              <p className="coreografias-filter-label">Nivel</p>
              <div className="coreografias-chips">
                {NIVELES.map((n) => (
                  <Chip
                    key={n.value}
                    label={n.label}
                    size="small"
                    onClick={() => toggleFiltro("nivel", n.value)}
                    color={filtros.nivel === n.value ? "primary" : "default"}
                    variant={filtros.nivel === n.value ? "filled" : "outlined"}
                  />
                ))}
              </div>
            </div>

            {/* Grupo: Género */}
            <div className="coreografias-filter-group">
              <p className="coreografias-filter-label">Género musical</p>
              <div className="coreografias-chips">
                {GENEROS.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    size="small"
                    onClick={() => toggleFiltro("genero", g)}
                    color={filtros.genero === g ? "primary" : "default"}
                    variant={filtros.genero === g ? "filled" : "outlined"}
                  />
                ))}
              </div>
            </div>

            {/* Grupo: Profesor */}
            <div className="coreografias-filter-group">
              <p className="coreografias-filter-label">Profesor</p>
              <div className="coreografias-chips">
                {PROFESORES_MOCK.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.nombre}
                    size="small"
                    onClick={() => toggleFiltro("profesor", p.id)}
                    color={filtros.profesor === p.id ? "primary" : "default"}
                    variant={filtros.profesor === p.id ? "filled" : "outlined"}
                  />
                ))}
              </div>
            </div>

            {/* Botón limpiar — solo visible si hay algo activo */}
            {hayFiltrosActivos && (
              <button
                className="btn btn-link coreografias-clear-btn"
                onClick={limpiarTodo}
              >
                <CloseIcon fontSize="small" />
                Limpiar filtros
              </button>
            )}
          </div>
        </Collapse>

        {/* ── Chips resumen de filtros activos (siempre visibles) ── */}
        {/*
          Cuando el panel está cerrado pero hay filtros activos, estos chips
          permiten ver qué está filtrado y quitarlo sin abrir el panel.
        */}
        {hayFiltrosActivos && (
          <div className="coreografias-active-filters">
            {filtros.nivel && (
              <Chip
                label={NIVELES.find((n) => n.value === filtros.nivel)?.label}
                size="small"
                color="primary"
                onDelete={() => toggleFiltro("nivel", filtros.nivel)}
              />
            )}
            {filtros.genero && (
              <Chip
                label={filtros.genero}
                size="small"
                color="primary"
                onDelete={() => toggleFiltro("genero", filtros.genero)}
              />
            )}
            {filtros.profesor && (
              <Chip
                label={
                  PROFESORES_MOCK.find((p) => p.id === filtros.profesor)?.nombre
                }
                size="small"
                color="primary"
                onDelete={() => toggleFiltro("profesor", filtros.profesor)}
              />
            )}
            {busqueda.trim().length > 1 && (
              <Chip
                label={`"${busqueda}"`}
                size="small"
                color="primary"
                onDelete={() => setBusqueda("")}
              />
            )}
          </div>
        )}

        {/* ── Contenido principal ── */}
        {hayFiltrosActivos ? (
          /* MODO GRILLA */
          <div className="coreografias-grid-section">
            <div className="coreografias-grid-header">
              <p className="coreografias-grid-count">
                {resultados.length === 0
                  ? "Sin resultados"
                  : `${resultados.length} coreografía${resultados.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {resultados.length === 0 ? (
              <div className="coreografias-empty">
                <p>No encontramos coreografías con ese criterio.</p>
                <button
                  className="btn btn-outline-primary"
                  onClick={limpiarTodo}
                >
                  Ver todas
                </button>
              </div>
            ) : (
              /*
                Grid responsivo con clases de Bootstrap:
                - col-6      → 2 columnas en móvil
                - col-sm-4   → 3 columnas en tablet
                - col-md-3   → 4 columnas en desktop
              */
              <div className="row g-3">
                {resultados.map((c) => (
                  <div
                    key={c.coreography_id}
                    className="col-6 col-sm-4 col-md-3"
                  >
                    <CoreografiaCard coreografia={c} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* MODO SECCIONES — carruseles como en el mockup */
          <div className="coreografias-secciones">
            {secciones
              .filter((s) => s.items.length > 0)
              .map((s) => (
                <CoreografiaCarrusel
                  key={s.key}
                  titulo={s.titulo}
                  coreografias={s.items}
                  // "Ver todos" activa el filtro de nivel correspondiente
                  // (para las secciones de nivel) o solo abre los filtros
                  onVerTodos={() => {
                    if (["basic", "intermediate", "advanced"].includes(s.key)) {
                      setFiltros((prev) => ({ ...prev, nivel: s.key }));
                    } else {
                      setFiltrosAbiertos(true);
                    }
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coreografias;
