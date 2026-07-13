import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Chip, IconButton, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Header from "../../components/layout/Header/Header.jsx";
import { UserService } from "../../api/userService.js";
import { useAuth } from "../../context/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import Footer from "../../components/layout/Footer/Footer.jsx";
import "./TeacherApplicationList.css";

const TeacherApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await UserService.getInternalUsers("profesor");
      // Mostrar todos los profesores — la tabla muestra el estado de cada uno
      setApplications(data.results);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error al cargar las solicitudes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAccept = async (id) => {
    try {
      await UserService.updateInternalUser(id, {
        validated: true,
        is_active: true,
      });
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al aceptar la solicitud.");
    }
  };

  const handleReject = async (id) => {
    try {
      await UserService.updateInternalUser(id, {
        is_active: false,
      });
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al rechazar la solicitud.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "nombre", headerName: "Nombre completo", flex: 1, minWidth: 160 },
    { field: "correo", headerName: "Correo", flex: 2, minWidth: 180 },
    { field: "identificacion", headerName: "Teléfono", flex: 1, minWidth: 130 },
    {
      field: "biography",
      headerName: "Biografía",
      flex: 2,
      minWidth: 200,
      renderCell: ({ value }) => value || "—",
    },
    {
      field: "years_of_experience",
      headerName: "Años exp.",
      width: 110,
      renderCell: ({ value }) => (value != null ? `${value} años` : "—"),
    },
    {
      field: "validated",
      headerName: "Estado",
      width: 130,
      renderCell: ({ row }) => {
        if (row.validated && row.is_active) {
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
                  sx={{ color: isPending ? "#2e7d32" : "#ccc" }}
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
                  sx={{ color: isPending ? "#c2185b" : "#ccc" }}
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
        showSearch={true}
        navItems={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Catalogo", to: "/catalogo" },
          { label: "Solicitudes", to: "/admin/solicitudes-profesores" },
          { label: "Usuarios", to: "/admin/usuarios" },
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

      <div className="container teacher-app-container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-10">
            {/* ── Encabezado ── */}
            <div className="teacher-app-header">
              <div className="teacher-app-header-text">
                <h1 className="teacher-app-title">Solicitudes de profesores</h1>
                <p className="teacher-app-subtitle">
                  {loading
                    ? "Cargando..."
                    : `${pending} solicitud${pending !== 1 ? "es" : ""} pendiente${pending !== 1 ? "s" : ""}`}
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

            {/* ── Tabla ── */}
            <div className="teacher-app-table">
              <DataGrid
                rows={applications}
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

export default TeacherApplicationList;
