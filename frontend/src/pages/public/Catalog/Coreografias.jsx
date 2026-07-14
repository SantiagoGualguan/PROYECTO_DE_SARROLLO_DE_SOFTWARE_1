// src/pages/Coreografias/Coreografias.jsx
//
// Página de catálogo — SOLO navegación/exploración (búsqueda, filtros,
// carruseles). La parte comercial (agregar al carrito, comprar) vive en
// CoreografiaDetail.jsx, no aquí.
//
// ── Shape de la respuesta (ya confirmado, no es una suposición) ─────────────
// CoreographySerializer usa `fields = "__all__"` sin ningún source= ni
// SerializerMethodField, así que el JSON usa los mismos nombres de atributo
// del modelo Django, que replican el DDL: coreography_id, c_name, image_url,
// c_description, dificulty_level, song_name, song_genre, price, times_sold,
// status, creation_date. `list()` en el ViewSet no pagina (regresa el array
// directo). `price` llega como STRING porque DRF serializa DecimalField así
// por defecto — por eso se envuelve en Number(...) abajo.
// Los FKs (profesor / assistent_profesor) no tienen serializer anidado, así
// que llegan como el id plano (number), no como objeto con nombre.
//
// ── Qué se corrigió en esta versión ──────────────────────────────────────────
// 1. Antes, si el catálogo llegaba vacío (0 coreografías activas), la página
//    no mostraba NADA — ni error ni mensaje — porque el contenedor de
//    secciones simplemente no renderiza nada si todas las secciones quedan
//    vacías. Ahora hay un estado explícito "catálogo vacío".
// 2. Se agregó un console.log de la respuesta cruda (quítalo cuando ya
//    confirmes que todo funciona) para poder diagnosticar rápido si vuelve
//    a pasar.
// 3. Al hacer click en una card (modo grilla) ahora navega a
//    /coreografias/:id (CoreografiaDetail). Si CoreografiaCarrusel maneja su
//    propia navegación internamente (no tengo su código fuente), probablemente
//    ya funciona igual ahí — si no, dime y lo ajustamos.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, InputAdornment, Chip, Collapse } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import CoreografiaCarrusel from "../../../components/common/CoreografiaCarrusel";
import CoreografiaCard from "../../../components/common/CoreografiaCard";
import Header from "../../../components/layout/Header/Header.jsx";
import Footer from "../../../components/layout/Footer/Footer.jsx";
// Ajusta esta ruta si tu archivo real vive en otro lado.
import { CoreographyService } from "../../../api/choreographyService";
import "./Coreografias.css";
import { useAuth } from "../../../context/AuthContext.jsx";
import LogoutIcon from "@mui/icons-material/Logout";

const NIVELES = [
  { value: "basic", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

const ROLES_STAFF = ["admin", "profesor", "director"];

// ── Adaptador API -> shape interno ───────────────────────────────────────────
// Ya no hay que adivinar nombres en español — se dejan solo los nombres
// confirmados del DDL/modelo. Se mantiene Number(...) por el string de DRF.
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
  // FK plano (no anidado): puede venir como "profesor" o "profesor_id"
  // según cómo se llamó el campo en el modelo.
  profesor_id: raw.profesor_id ?? raw.profesor ?? null,
  assistent_profesor_id:
    raw.assistent_profesor_id ?? raw.assistent_profesor ?? null,
  status: raw.status ?? "active",
  creation_date: raw.creation_date,
});

const filtrarCoreografiasLocal = (
  lista,
  { busqueda, nivel, genero, profesorId },
) => {
  const q = busqueda?.trim().toLowerCase();

  return lista.filter((c) => {
    if (nivel && c.dificulty_level !== nivel) return false;
    if (genero && c.song_genre !== genero) return false;
    if (
      profesorId &&
      c.profesor_id !== profesorId &&
      c.assistent_profesor_id !== profesorId
    )
      return false;

    if (q) {
      const coincide =
        c.c_name?.toLowerCase().includes(q) ||
        c.song_name?.toLowerCase().includes(q) ||
        c.c_description?.toLowerCase().includes(q);
      if (!coincide) return false;
    }

    return true;
  });
};

const formatearGenero = (g) =>
  g ? g.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "";

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

const Coreografias = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, rol, loading: authLoading } = useAuth();

  const [coreografias, setCoreografias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState({
    nivel: null,
    genero: null,
    profesor: null,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getHeaderProps = () => {
    // No logeado
    if (!isAuthenticated) {
      return {
        showSearch: true,
        navItems: [
          { label: "Coreografías", to: "/catalogo" },
          { label: "Profesores", to: "/profesores" },
        ],
        rightActions: [
          {
            label: "Inicia sesión",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/login"),
          },
          {
            label: "Regístrate",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/registro"),
          },
        ],
      };
    }

    // Admin, profesor o director
    if (ROLES_STAFF.includes(rol)) {
      return {
        showSearch: true,
        navItems: [
          { label: "dashboard", to: "/dashboard" },
          { label: "profesores", to: "/profesores" },
        ],
        rightActions: [
          {
            label: "salir",
            variant: "outlined",
            color: "error",
            icon: <LogoutIcon />,
            onClick: handleLogout,
          },
        ],
      };
    }

    // Cliente (default, logeado y sin rol staff)
    return {
      showSearch: false,
      navItems: [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Catalogo", to: "/catalogo" },
        { label: "Mi Carrito", to: "/carrito" },
        { label: "Mis compras", to: "/mis-compras" },
      ],
      rightActions: [
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
      ],
    };
  };

  const cargarCoreografias = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await CoreographyService.getAll();
      // TEMP DEBUG: si el catálogo vuelve a aparecer vacío, revisa esto en
      // la consola para ver exactamente qué mandó el backend.
      console.log("[Coreografias] respuesta cruda de la API:", data);

      const lista = Array.isArray(data) ? data : (data?.results ?? []);
      setCoreografias(lista.map(normalizarCoreografia));
    } catch (err) {
      console.error("Error cargando coreografías:", err);
      setError(
        "No pudimos cargar el catálogo de coreografías. Intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCoreografias();
  }, [cargarCoreografias]);

  const activas = useMemo(
    () => coreografias.filter((c) => c.status === "active"),
    [coreografias],
  );

  const GENEROS = useMemo(
    () => [...new Set(activas.map((c) => c.song_genre).filter(Boolean))].sort(),
    [activas],
  );

  const PROFESORES = useMemo(() => {
    const mapa = new Map();
    activas.forEach((c) => {
      if (c.profesor_id != null && !mapa.has(c.profesor_id)) {
        mapa.set(c.profesor_id, `Profesor #${c.profesor_id}`);
      }
    });
    return [...mapa.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.id - b.id);
  }, [activas]);

  const hayFiltrosActivos =
    busqueda.trim().length > 1 ||
    Object.values(filtros).some((v) => v !== null);

  const cantidadFiltros = Object.values(filtros).filter(
    (v) => v !== null,
  ).length;

  const resultados = useMemo(() => {
    if (!hayFiltrosActivos) return [];
    return filtrarCoreografiasLocal(activas, {
      busqueda: busqueda.trim().length > 1 ? busqueda : undefined,
      nivel: filtros.nivel ?? undefined,
      genero: filtros.genero ?? undefined,
      profesorId: filtros.profesor ?? undefined,
    });
  }, [activas, busqueda, filtros, hayFiltrosActivos]);

  const secciones = useMemo(() => construirSecciones(activas), [activas]);
  const seccionesConDatos = secciones.filter((s) => s.items.length > 0);

  const handleBusqueda = (e) => setBusqueda(e.target.value);

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

  const irADetalle = (coreografiaId) =>
    navigate(`/coreografias/${coreografiaId}`);

  if (cargando) {
    return (
      <div className="coreografias-page">
        <div className="container coreografias-loading">
          <p>Cargando catálogo de coreografías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coreografias-page">
        <div className="container coreografias-error">
          <p>{error}</p>
          <button
            className="btn btn-outline-primary"
            onClick={cargarCoreografias}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header showMenu={true} showFullLogo={true} {...getHeaderProps()} />
      <div className="coreografias-page">
        <div className="container">
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

            <button
              className={`btn coreografias-filter-btn ${filtrosAbiertos ? "coreografias-filter-btn--active" : ""}`}
              onClick={() => setFiltrosAbiertos((prev) => !prev)}
            >
              <TuneIcon fontSize="small" />
              Filtro
              {cantidadFiltros > 0 && (
                <span className="coreografias-filter-badge">
                  {cantidadFiltros}
                </span>
              )}
            </button>
          </div>

          <Collapse in={filtrosAbiertos}>
            <div className="coreografias-filters-panel">
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
                      variant={
                        filtros.nivel === n.value ? "filled" : "outlined"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="coreografias-filter-group">
                <p className="coreografias-filter-label">Género musical</p>
                <div className="coreografias-chips">
                  {GENEROS.map((g) => (
                    <Chip
                      key={g}
                      label={formatearGenero(g)}
                      size="small"
                      onClick={() => toggleFiltro("genero", g)}
                      color={filtros.genero === g ? "primary" : "default"}
                      variant={filtros.genero === g ? "filled" : "outlined"}
                    />
                  ))}
                </div>
              </div>

              <div className="coreografias-filter-group">
                <p className="coreografias-filter-label">Profesor</p>
                <div className="coreografias-chips">
                  {PROFESORES.map((p) => (
                    <Chip
                      key={p.id}
                      label={p.nombre}
                      size="small"
                      onClick={() => toggleFiltro("profesor", p.id)}
                      color={filtros.profesor === p.id ? "primary" : "default"}
                      variant={
                        filtros.profesor === p.id ? "filled" : "outlined"
                      }
                    />
                  ))}
                </div>
              </div>

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
                  label={formatearGenero(filtros.genero)}
                  size="small"
                  color="primary"
                  onDelete={() => toggleFiltro("genero", filtros.genero)}
                />
              )}
              {filtros.profesor && (
                <Chip
                  label={
                    PROFESORES.find((p) => p.id === filtros.profesor)?.nombre
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

          {hayFiltrosActivos ? (
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
                <div className="row g-3">
                  {resultados.map((c) => (
                    <div
                      key={c.coreography_id}
                      className="col-6 col-sm-4 col-md-3"
                      onClick={() => irADetalle(c.coreography_id)}
                      style={{ cursor: "pointer" }}
                    >
                      <CoreografiaCard coreografia={c} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : seccionesConDatos.length === 0 ? (
            // Antes esto no mostraba nada. Si ves este mensaje, el problema
            // es que /api/choreographies/ respondió 0 coreografías con
            // status "active" — revisa el console.log de arriba.
            <div className="coreografias-empty">
              <p>No hay coreografías disponibles todavía.</p>
            </div>
          ) : (
            <div className="coreografias-secciones">
              {seccionesConDatos.map((s) => (
                <CoreografiaCarrusel
                  key={s.key}
                  titulo={s.titulo}
                  coreografias={s.items}
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
      <Footer />
    </div>
  );
};

export default Coreografias;
