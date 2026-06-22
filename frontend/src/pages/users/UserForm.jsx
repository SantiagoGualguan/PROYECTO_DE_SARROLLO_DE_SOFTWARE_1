import React from "react";
import Header from "../../components/layout/Header/Header.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton, InputAdornment, MenuItem } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Button from "../../components/ui/Button/Button.jsx";
import "./UserForm.css";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "director", label: "Director" },
];

const UserForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    u_name: "",
    last_name: "",
    email: "",
    phone: "",
    u_password: "",
    u_type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
                name="u_name"
                value={form.u_name}
                onChange={handleChange}
              />
              <TextField
                label="Apellido"
                variant="outlined"
                fullWidth
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                label="Teléfono"
                variant="outlined"
                fullWidth
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <TextField
                label="Contraseña"
                variant="outlined"
                fullWidth
                name="u_password"
                type={showPassword ? "text" : "password"}
                value={form.u_password}
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
                name="u_type"
                value={form.u_type}
                onChange={handleChange}
              >
                {ROLES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              {/* ── Botones ── */}
              <div className="userform-actions">
                <Button
                  label="CANCELAR"
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/admin/usuarios")}
                />
                <Button
                  label="CREAR USUARIO"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={
                    !form.u_name ||
                    !form.last_name ||
                    !form.email ||
                    !form.phone ||
                    !form.u_password ||
                    !form.u_type
                  }
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
