import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { UserService } from "../../api/userService.js";
import "./UserForm.css"; // reutiliza los mismos estilos

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
  { value: "profesor", label: "Profesor" },
];

const UserEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    identificacion: "",
    contrasena: "",
    rol: "",
    is_active: true,
    validated: false,
  });

  // Cargar datos del usuario al montar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await UserService.getInternalUserDetail(id);
        // El backend devuelve "nombre" como nombre completo
        setForm({
          nombre: data.nombre || "",
          correo: data.correo || "",
          identificacion: data.identificacion || "",
          contrasena: "", // nunca se pre-rellena por seguridad
          rol: data.rol || "",
          is_active: data.is_active ?? true,
          validated: data.validated ?? false,
        });
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Error al cargar los datos del usuario.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Solo enviar campos que tienen valor — contrasena es opcional
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        identificacion: form.identificacion,
        rol: form.rol,
        is_active: form.is_active,
        validated: form.validated,
      };

      // Solo incluir contraseña si el admin escribió una nueva
      if (form.contrasena.trim()) {
        payload.contrasena = form.contrasena;
      }

      await UserService.updateInternalUser(id, payload);
      setSuccess("Usuario actualizado con éxito.");
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError("Error al actualizar el usuario. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Header
          showMenu={true}
          showFullLogo={true}
          showSearch={false}
          navItems={[
            { label: "Usuarios", to: "/admin/usuarios" },
            { label: "Coreografías", to: "/coreografias" },
          ]}
          menuItems={[
            { label: "Lista de usuarios", to: "/admin/usuarios" },
            { label: "Crear usuario", to: "/admin/usuarios/new" },
          ]}
        />
        <p style={{ padding: "2rem" }}>Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          { label: "Lista de usuarios", to: "/admin/usuarios" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
        ]}
      />
      <div className="container userform-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="userform-header">
              <h1 className="userform-title">Editar usuario</h1>
              <p className="userform-subtitle">
                Modifica los datos del usuario
              </p>
            </div>

            <div className="userform-form">
              <TextField
                label="Nombre completo"
                variant="outlined"
                fullWidth
                name="nombre"
                value={form.nombre}
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
                label="Nueva contraseña (opcional)"
                variant="outlined"
                fullWidth
                name="contrasena"
                type={showPassword ? "text" : "password"}
                value={form.contrasena}
                onChange={handleChange}
                helperText="Déjalo vacío para mantener la contraseña actual"
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

              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={handleChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Usuario activo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.validated}
                    onChange={handleChange}
                    name="validated"
                    color="primary"
                  />
                }
                label="Usuario validado"
              />

              {success && (
                <p style={{ color: "green", fontSize: "0.875rem" }}>
                  {success}
                </p>
              )}
              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>
              )}

              <div className="userform-actions">
                <Button
                  label="Volver"
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/admin/usuarios")}
                />
                <Button
                  label={loading ? "Guardando..." : "Guardar cambios"}
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
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

export default UserEditForm;
