import React from "react";
import Header from "../../components/layout/Header/Header.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import Button from "../../components/ui/Button/Button.jsx";
import "./UserList.css";

// ── Datos mock ──
const MOCK_USERS = [
  {
    id: 1,
    u_name: "Carlos",
    last_name: "Pérez",
    email: "carlos@gmail.com",
    phone: "3001234567",
    u_type: "admin",
    is_active: true,
    validated: true,
    creation_date: "2025-01-10",
  },
  {
    id: 2,
    u_name: "Laura",
    last_name: "Gómez",
    email: "laura@gmail.com",
    phone: "3107654321",
    u_type: "director",
    is_active: true,
    validated: true,
    creation_date: "2025-02-14",
  },
  {
    id: 3,
    u_name: "Andrés",
    last_name: "Torres",
    email: "andres@gmail.com",
    phone: "3209876543",
    u_type: "profesor",
    is_active: false,
    validated: false,
    creation_date: "2025-03-05",
  },
  {
    id: 4,
    u_name: "María",
    last_name: "Ruiz",
    email: "maria@gmail.com",
    phone: "3154321098",
    u_type: "client",
    is_active: true,
    validated: true,
    creation_date: "2025-04-20",
  },
  {
    id: 5,
    u_name: "Juan",
    last_name: "Martínez",
    email: "juan@gmail.com",
    phone: "3001112233",
    u_type: "client",
    is_active: true,
    validated: false,
    creation_date: "2025-05-01",
  },
  {
    id: 6,
    u_name: "Sofía",
    last_name: "López",
    email: "sofia@gmail.com",
    phone: "3209998877",
    u_type: "profesor",
    is_active: true,
    validated: true,
    creation_date: "2025-05-15",
  },
];

const ROL_COLORS = {
  admin: { bg: "#fce4ec", color: "#c2185b" },
  director: { bg: "#e8eaf6", color: "#3949ab" },
  profesor: { bg: "#e8f5e9", color: "#2e7d32" },
  client: { bg: "#fff3e0", color: "#e65100" },
};

const columns = [
  { field: "id", headerName: "ID", width: 60 },
  { field: "u_name", headerName: "Nombre", flex: 1, minWidth: 120 },
  { field: "last_name", headerName: "Apellido", flex: 1, minWidth: 120 },
  { field: "email", headerName: "Correo", flex: 2, minWidth: 180 },
  { field: "phone", headerName: "Teléfono", flex: 1, minWidth: 130 },
  {
    field: "u_type",
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
  { field: "creation_date", headerName: "Creado", width: 110 },
];

const UserList = () => {
  const navigate = useNavigate();
  const [users] = useState(MOCK_USERS);

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          // ← items exclusivos del sidebar
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
                  {users.length} usuarios registrados
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

            <div className="userlist-table">
              <DataGrid
                rows={users}
                columns={columns}
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
    </div>
  );
};

export default UserList;
