import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Chip, IconButton, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Header from "../../components/layout/Header/Header.jsx";
import "./TeacherApplicationList.css";

// ── Datos mock — profesores con validated = false ──
const MOCK_APPLICATIONS = [
  {
    id: 1,
    u_name: "Valentina",
    last_name: "Castro",
    email: "vale@gmail.com",
    phone: "3001234567",
    is_active: true,
    validated: false,
    creation_date: "2025-06-01",
  },
  {
    id: 2,
    u_name: "Diego",
    last_name: "Morales",
    email: "diego@gmail.com",
    phone: "3107654321",
    is_active: true,
    validated: false,
    creation_date: "2025-06-05",
  },
  {
    id: 3,
    u_name: "Camila",
    last_name: "Herrera",
    email: "camila@gmail.com",
    phone: "3209876543",
    is_active: true,
    validated: false,
    creation_date: "2025-06-10",
  },
  {
    id: 4,
    u_name: "Sebastián",
    last_name: "Vargas",
    email: "sebas@gmail.com",
    phone: "3154321098",
    is_active: true,
    validated: false,
    creation_date: "2025-06-12",
  },
];

const teacherApplicationList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  const handleAccept = (id) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, validated: true } : app)),
    );
  };

  const handleReject = (id) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, is_active: false } : app)),
    );
  };

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "u_name", headerName: "Nombre", flex: 1, minWidth: 120 },
    { field: "last_name", headerName: "Apellido", flex: 1, minWidth: 120 },
    { field: "email", headerName: "Correo", flex: 2, minWidth: 180 },
    { field: "phone", headerName: "Teléfono", flex: 1, minWidth: 130 },
    { field: "creation_date", headerName: "Fecha solicitud", width: 130 },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: ({ row }) => {
        if (row.validated) {
          return (
            <Chip
              label="Aceptado"
              size="small"
              sx={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                fontWeight: 600,
              }}
            />
          );
        }
        if (!row.is_active) {
          return (
            <Chip
              label="Rechazado"
              size="small"
              sx={{
                backgroundColor: "#fce4ec",
                color: "#c2185b",
                fontWeight: 600,
              }}
            />
          );
        }
        return (
          <Chip
            label="Pendiente"
            size="small"
            sx={{
              backgroundColor: "#fff3e0",
              color: "#e65100",
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => {
        const isPending = !row.validated && row.is_active;
        return (
          <div className="teacher-app-actions">
            <Tooltip title="Aceptar">
              <span>
                <IconButton
                  onClick={() => handleAccept(row.id)}
                  disabled={!isPending}
                  sx={{
                    color: isPending ? "#2e7d32" : "#ccc",
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Rechazar">
              <span>
                <IconButton
                  onClick={() => handleReject(row.id)}
                  disabled={!isPending}
                  sx={{
                    color: isPending ? "#c2185b" : "#ccc",
                  }}
                >
                  <HighlightOffIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  const pending = applications.filter(
    (a) => !a.validated && a.is_active,
  ).length;

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Solicitudes", to: "/admin/solicitudes-profesores" },
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Solicitudes de profesores", to: "/director/solicitudes" },
        ]}
      />

      <div className="container teacher-app-container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-10">
            {/* ── Encabezado ── */}
            <div className="teacher-app-header">
              <div className="teacher-app-header-text">
                <h1 className="teacher-app-title">Solicitudes de profesores</h1>
                <p className="teacher-app-subtitle">
                  {pending} solicitud{pending !== 1 ? "es" : ""} pendiente
                  {pending !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* ── Tabla ── */}
            <div className="teacher-app-table">
              <DataGrid
                rows={applications}
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

export default teacherApplicationList;
