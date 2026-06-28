import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { UserService } from "../../api/userService.js";
import "./UserProfile.css";

const UserProfile = () => {
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
  });

  // Cargar datos del perfil al montar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await UserService.getClientProfile();
        setForm({
          nombre: data.nombre || "",
          correo: data.correo || "",
          identificacion: data.identificacion || "",
          contrasena: "",
        });
      } catch (err) {
        setError(
          err.response?.data?.detail || "Error al cargar los datos del perfil.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        identificacion: form.identificacion,
      };

      if (form.contrasena.trim()) {
        payload.contrasena = form.contrasena;
      }

      await UserService.updateClientProfile(payload);
      setSuccess("Perfil actualizado con éxito.");
      setForm((prev) => ({ ...prev, contrasena: "" }));
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        setError(Object.values(data).flat().join(" "));
      } else {
        setError("Error al actualizar el perfil. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Header showMenu={false} showFullLogo={true} showSearch={false} />
        <p style={{ padding: "2rem" }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Catalogo", to: "/coreografías" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        rightActions={[{ label: "Mi perfil", to: "/perfil" }]}
      />

      <div className="container userprofile-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="userprofile-header">
              <h1 className="userprofile-title">Mi perfil</h1>
              <p className="userprofile-subtitle">
                Actualiza tus datos personales
              </p>
            </div>

            {/* Tarjeta con info actual del usuario */}
            <div className="userprofile-info-card">
              <div className="userprofile-avatar">
                {form.nombre ? form.nombre.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="userprofile-info-text">
                <p className="userprofile-info-name">
                  {form.nombre || "Sin nombre"}
                </p>
                <p className="userprofile-info-email">
                  {form.correo || "Sin correo"}
                </p>
              </div>
            </div>
            <hr className="userprofile-divider" />

            <div className="userprofile-form">
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

              {success && (
                <p style={{ color: "green", fontSize: "0.875rem" }}>
                  {success}
                </p>
              )}
              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>
              )}

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
  );
};

export default UserProfile;
