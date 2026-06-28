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
import { UserService } from "../../api/userService.js";
import "./UserList.css";

const ROL_COLORS = {
  admin: { bg: "#fce4ec", color: "#c2185b" },
  director: { bg: "#e8eaf6", color: "#3949ab" },
  profesor: { bg: "#e8f5e9", color: "#2e7d32" },
  client: { bg: "#fff3e0", color: "#e65100" },
};

const UserList = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await UserService.getInternalUsers();
      setUsers(data.results);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (userId, userName) => {
    setDeleteDialog({ open: true, userId, userName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await UserService.deleteInternalUser(deleteDialog.userId);
      setDeleteDialog({ open: false, userId: null, userName: "" });
      // Recargar la lista después de eliminar
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al eliminar el usuario.");
      setDeleteDialog({ open: false, userId: null, userName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null, userName: "" });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "correo", headerName: "Correo", flex: 2, minWidth: 180 },
    { field: "identificacion", headerName: "Teléfono", flex: 1, minWidth: 130 },
    {
      field: "rol",
      headerName: "Rol",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: ROL_COLORS[value]?.bg,
            color: ROL_COLORS[value]?.color,
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      field: "is_active",
      headerName: "Activo",
      width: 90,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Sí" : "No"}
          size="small"
          sx={{
            backgroundColor: value ? "#e8f5e9" : "#fce4ec",
            color: value ? "#2e7d32" : "#c2185b",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "validated",
      headerName: "Validado",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Sí" : "No"}
          size="small"
          sx={{
            backgroundColor: value ? "#e8f5e9" : "#fff3e0",
            color: value ? "#2e7d32" : "#e65100",
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
              onClick={() => navigate(`/admin/usuarios/${row.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(row.id, row.nombre)}
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
          { label: "dashboard", to: "/dashboard" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Lista de usuarios", to: "/admin/usuarios" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
        ]}
      />
      <div className="container userlist-container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-10">
            {/* ── Encabezado ── */}
            <div className="userlist-header">
              <div className="userlist-header-text">
                <h1 className="userlist-title">Usuarios</h1>
                <p className="userlist-subtitle">
                  {loading
                    ? "Cargando..."
                    : `${users.length} usuarios registrados`}
                </p>
              </div>
              <Button
                label="Crear usuario"
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => navigate("/admin/usuarios/new")}
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

            <div className="userlist-table">
              <DataGrid
                rows={users}
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

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar a{" "}
            <strong>{deleteDialog.userName}</strong>? Esta acción desactivará al
            usuario.
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
            label="Eliminar"
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

export default UserList;
