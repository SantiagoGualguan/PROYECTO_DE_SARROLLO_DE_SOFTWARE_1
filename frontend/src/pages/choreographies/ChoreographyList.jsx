// src/pages/choreographies/ChoreographyList.jsx
//
// Lista de TODAS las coreografías para admin/director. Es de solo lectura:
// no hay botones de crear, editar ni borrar acá — solo mostrar todos los
// datos, como pediste. Mismo esqueleto que UserList.jsx (DataGrid + Header),
// mismas clases *-container/*-header/*-table pero con prefijo
// "choreographylist" para no chocar con userlist.css si ambos css conviven
// en el proyecto.
//
// ── Supuestos a verificar ────────────────────────────────────────────────────
// - GET /api/choreographies/ sin filtros: asumo que devuelve TODAS las
//   coreografías (activas e inactivas). Si tu backend filtra por status=active
//   por defecto, esta lista no va a mostrar las inactivas y habría que pedirle
//   al equipo de backend un parámetro tipo ?status=all, o llamarlo dos veces
//   (?status=active y ?status=inactive) y unir resultados.
// - Nombres de campo: uso fallback entre las dos variantes que vi en tu doc
//   (coreography_id/id, profesor_id/profesor, assistent_profesor_id/
//   assistant_profesor) porque la documentación no es 100% consistente sobre
//   esto. Si confirmas los nombres reales, se puede simplificar.
// - Ruta esperada: /admin/coreografias (ajusta si la registras distinto en
//   tu router — no la vi en el AppRouter.jsx que me compartiste, solo
//   /coreografias que usa el catálogo comercial).

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Chip, Avatar } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { CoreographyService } from "../../api/choreographyService.js";
import LogoutIcon from "@mui/icons-material/Logout";
import Footer from "../../components/layout/Footer/Footer.jsx";
import { useAuth } from "../../context/AuthContext";
import "./ChoreographyList.css";

const DIFICULTAD_LABELS = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};
const DIFICULTAD_COLORS = {
  basic: { bg: "#e8f5e9", color: "#2e7d32" },
  intermediate: { bg: "#fff3e0", color: "#e65100" },
  advanced: { bg: "#fce4ec", color: "#c2185b" },
};
const STATUS_COLORS = {
  active: { bg: "#e8f5e9", color: "#2e7d32" },
  inactive: { bg: "#fce4ec", color: "#c2185b" },
};

const normalizarCoreografia = (raw) => ({
  id: raw.coreography_id ?? raw.id,
  c_name: raw.c_name ?? "",
  image_url: raw.image_url ?? "",
  dificulty_level: raw.dificulty_level ?? null,
  song_name: raw.song_name ?? "",
  song_genre: raw.song_genre ?? "",
  price: Number(raw.price ?? 0),
  times_sold: Number(raw.times_sold ?? 0),
  profesor_id: raw.profesor_id ?? raw.profesor ?? null,
  assistent_profesor_id:
    raw.assistent_profesor_id ?? raw.assistant_profesor ?? null,
  status: raw.status ?? "active",
  creation_date: raw.creation_date ?? null,
});

const ChoreographyList = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [coreografias, setCoreografias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchCoreografias = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await CoreographyService.getAll();
      const lista = Array.isArray(data) ? data : (data?.results ?? []);
      setCoreografias(lista.map(normalizarCoreografia));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error al cargar las coreografías.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreografias();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "image_url",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: ({ value }) => (
        <Avatar
          src={value || undefined}
          variant="rounded"
          sx={{ bgcolor: "#fce4ec" }}
        >
          <LibraryMusicIcon sx={{ color: "#e5598f", fontSize: "1.1rem" }} />
        </Avatar>
      ),
    },
    { field: "c_name", headerName: "Nombre", flex: 1.4, minWidth: 160 },
    {
      field: "dificulty_level",
      headerName: "Nivel",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={DIFICULTAD_LABELS[value] || value || "—"}
          size="small"
          sx={{
            backgroundColor: DIFICULTAD_COLORS[value]?.bg,
            color: DIFICULTAD_COLORS[value]?.color,
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    { field: "song_name", headerName: "Canción", flex: 1, minWidth: 140 },
    { field: "song_genre", headerName: "Género", width: 110 },
    {
      field: "price",
      headerName: "Precio",
      width: 110,
      renderCell: ({ value }) => `$${value.toLocaleString("es-CO")}`,
    },
    { field: "times_sold", headerName: "Ventas", width: 90 },
    { field: "profesor_id", headerName: "Profesor", width: 100 },
    { field: "assistent_profesor_id", headerName: "Asistente", width: 100 },
    {
      field: "status",
      headerName: "Estado",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value === "active" ? "Activa" : "Inactiva"}
          size="small"
          sx={{
            backgroundColor: STATUS_COLORS[value]?.bg,
            color: STATUS_COLORS[value]?.color,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "creation_date",
      headerName: "Creada",
      width: 120,
      renderCell: ({ value }) =>
        value ? new Date(value).toLocaleDateString("es-CO") : "—",
    },
  ];

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "dashboard", to: "/dashboard" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Catalogo", to: "/catalogo" },
          { label: "Coreografías", to: "/admin/coreografias" },
        ]}
        menuItems={[
          { label: "Solicitudes de profesores", to: "/director/solicitudes" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/admin/coreografias" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
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
      <div className="container choreographylist-container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-11 col-xl-11">
            {/* ── Encabezado ── */}
            <div className="choreographylist-header">
              <div className="choreographylist-header-text">
                <h1 className="choreographylist-title">Coreografías</h1>
                <p className="choreographylist-subtitle">
                  {loading
                    ? "Cargando..."
                    : `${coreografias.length} coreografías registradas`}
                </p>
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </p>
            )}

            <div className="choreographylist-table">
              <DataGrid
                rows={coreografias}
                columns={columns}
                loading={loading}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                sx={{
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--font-size-xs)",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "var(--color-peach)",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "rgba(229, 89, 143, 0.05)",
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChoreographyList;
