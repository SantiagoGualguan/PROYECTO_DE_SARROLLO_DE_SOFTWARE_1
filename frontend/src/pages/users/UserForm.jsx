import React, { useState } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton, InputAdornment, MenuItem } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Button from "../../components/ui/Button/Button.jsx";
import { UserService } from "../../api/userService.js";
import { useAuth } from "../../context/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import "./UserForm.css";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
];

const UserForm = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    identificacion: "",
    contrasena: "",
    rol: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      const { data } = await UserService.createInternalUser({
        nombre: `${form.nombre} ${form.apellido}`.trim(),
        correo: form.correo,
        identificacion: form.identificacion,
        contrasena: form.contrasena,
        rol: form.rol,
      });

      // Limpiar formulario y mostrar éxito
      setForm({
        nombre: "",
        apellido: "",
        correo: "",
        identificacion: "",
        contrasena: "",
        rol: "",
      });

      setSuccess(`Usuario ${data.user.nombre} creado con éxito.`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError("Error al crear el usuario. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.nombre &&
    form.apellido &&
    form.correo &&
    form.identificacion &&
    form.contrasena &&
    form.rol;

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "dashboard", to: "/dashboard" },
          { label: "Catalogo", to: "/catalogo" },
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
      <div className="container userform-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* ── Encabezado ── */}
            <div className="userform-header">
              <h1 className="userform-title">Crear usuario</h1>
              <p className="userform-subtitle">
                Registra un nuevo administrador o director
              </p>
            </div>

            {/* ── Formulario ── */}
            <div className="userform-form">
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
              <TextField
                label="Apellido"
                variant="outlined"
                fullWidth
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
              />
              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
              />
              <TextField
                label="Teléfono / Identificación"
                variant="outlined"
                fullWidth
                name="identificacion"
                value={form.identificacion}
                onChange={handleChange}
              />
              <TextField
                label="Contraseña"
                variant="outlined"
                fullWidth
                name="contrasena"
                type={showPassword ? "text" : "password"}
                value={form.contrasena}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* ── Selector de rol ── */}
              <TextField
                label="Rol"
                variant="outlined"
                fullWidth
                select
                name="rol"
                value={form.rol}
                onChange={handleChange}
              >
                {ROLES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              {success && (
                <p style={{ color: "green", fontSize: "0.875rem" }}>
                  {success}
                </p>
              )}
              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>
              )}

              {/* ── Botones ── */}
              <div className="userform-actions">
                <Button
                  label="CANCELAR"
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() =>
                    setForm({
                      nombre: "",
                      apellido: "",
                      correo: "",
                      identificacion: "",
                      contrasena: "",
                      rol: "",
                    })
                  }
                />
                <Button
                  label={loading ? "Creando..." : "Crear usuario"}
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!isFormValid || loading}
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
