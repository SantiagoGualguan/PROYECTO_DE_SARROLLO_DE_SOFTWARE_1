// src/pages/choreographies/ProfesorChoreographyList.jsx
//
// Lista de coreografías del profesor logueado. A diferencia de
// ChoreographyList.jsx (admin/director, solo lectura), acá SÍ hay acciones:
// Editar → navega a /coreografias/:id/editar (el mismo ChoreographyForm.jsx
// que ya armamos, en modo edición).
// Eliminar → soft delete: llama a CoreographyService.delete(id), que según
// choreographyService.js pone status = "inactive" en vez de borrar la fila.
// El diálogo de confirmación avisa exactamente eso, para no dar la impresión
// de que se borra el registro.
//
// Mismo esqueleto que UserList.jsx (DataGrid + Header + Dialog de
// confirmación), clases con prefijo "profesorcoreografias".
//
// ── Supuestos a verificar ────────────────────────────────────────────────────
// - Filtro por profesor: uso CoreographyService.getAll({ profesor: user.id }),
//   confirmado contra la documentación (GET /api/choreographies/?profesor=<id>).
//   Si tu backend NO filtra automáticamente por el usuario autenticado y este
//   query param no aplica los permisos (por ejemplo, si cualquiera puede pasar
//   ?profesor=<otro_id> y ver coreografías ajenas), eso es un tema de
//   seguridad del backend, no de este componente — avísame si quieres que
//   filtre también en el cliente como capa extra.
// - Nombres de campo: mismo fallback que en ChoreographyList.jsx
//   (coreography_id/id, profesor_id/profesor) por la misma inconsistencia
//   que vi en la documentación.
// - Ruta esperada para esta página: /profesor/coreografias (no estaba en el
//   AppRouter.jsx que compartiste — falta agregarla, ver el <Route> sugerido
//   más abajo en el mensaje).

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "../../components/ui/Button/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { CoreographyService } from "../../api/choreographyService.js";
import LogoutIcon from "@mui/icons-material/Logout";
import "./ProfesorChoreographyList.css";

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
  dificulty_level: raw.dificulty_level ?? null,
  song_name: raw.song_name ?? "",
  song_genre: raw.song_genre ?? "",
  price: Number(raw.price ?? 0),
  times_sold: Number(raw.times_sold ?? 0),
  status: raw.status ?? "active",
});

const ProfesorChoreographyList = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [coreografias, setCoreografias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    nombre: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchCoreografias = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await CoreographyService.getAll({ profesor: user.id });
      const lista = Array.isArray(data) ? data : (data?.results ?? []);
      setCoreografias(lista.map(normalizarCoreografia));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error al cargar tus coreografías.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreografias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDeleteClick = (id, nombre) => {
    setDeleteDialog({ open: true, id, nombre });
  };

  const handleDeleteConfirm = async () => {
    try {
      await CoreographyService.delete(deleteDialog.id);
      setDeleteDialog({ open: false, id: null, nombre: "" });
      fetchCoreografias();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error al desactivar la coreografía.",
      );
      setDeleteDialog({ open: false, id: null, nombre: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, nombre: "" });
  };

  const columns = [
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
      field: "acciones",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => navigate(`/coreografias/${row.id}/editar`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar">
            <IconButton
              size="small"
              disabled={row.status === "inactive"}
              onClick={() => handleDeleteClick(row.id, row.c_name)}
            >
              <DeleteIcon fontSize="small" sx={{ color: "#c2185b" }} />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

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
          { label: "Catalogo", to: "/coreografias" },
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
      <div className="container profesorcoreografias-container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-10">
            {/* ── Encabezado ── */}
            <div className="profesorcoreografias-header">
              <div className="profesorcoreografias-header-text">
                <h1 className="profesorcoreografias-title">Mis coreografías</h1>
                <p className="profesorcoreografias-subtitle">
                  {loading
                    ? "Cargando..."
                    : `${coreografias.length} coreografías`}
                </p>
              </div>
              <Button
                label="Crear coreografía"
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => navigate("/coreografias/new")}
              />
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

            <div className="profesorcoreografias-table">
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

      {/* Diálogo de confirmación de desactivación */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar desactivación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas desactivar{" "}
            <strong>{deleteDialog.nombre}</strong>? Dejará de mostrarse en el
            catálogo, pero no se elimina de la base de datos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            label="Cancelar"
            variant="outlined"
            color="primary"
            size="medium"
            onClick={handleDeleteCancel}
          />
          <Button
            label="Desactivar"
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleDeleteConfirm}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfesorChoreographyList;
