import React from "react";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { AuthService } from "../../api/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  //const [captchaToken, setCaptchaToken] = useState(null);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.register({
        first_name: form.nombres,
        last_name: form.apellidos,
        phone: form.telefono,
        email: form.correo,
        password: form.password,
      });

      // El registro siempre crea un cliente
      navigate("/login", {
        state: {
          mensaje: "Cuenta creada con éxito. Inicia sesión para continuar.",
        },
      });
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        // Si viene como { "detail": "..." }
        if (data.detail) {
          setError(data.detail);
        } else {
          // Si viene como { "password": ["..."], "email": ["..."] }
          const mensajes = Object.values(data).flat();
          setError(mensajes.join(" "));
        }
      } else {
        setError(
          "Error al registrarse. Verifica los datos e intenta de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        rightActions={[
          {
            label: "Inicia sesión",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/login"),
          },
        ]}
      />
      <div className="container register-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* ── Logo y título ── */}
            <div className="register-header">
              <p className="register-logo">
                <span className="register-logo-dance">Dance</span>
                <span className="register-logo-learn">Learn</span>
              </p>
              <h1 className="register-title">Regístrate y aprende a bailar</h1>
              <p className="register-subtitle">Sigue los pasos a tu ritmo</p>
            </div>

            {/* ── Formulario ── */}
            <div className="register-form">
              <TextField
                label="Nombres"
                variant="outlined"
                fullWidth
                size="medium"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
              />
              <TextField
                label="Apellidos"
                variant="outlined"
                fullWidth
                size="medium"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
              />

              <TextField
                label="Número de teléfono"
                variant="outlined"
                fullWidth
                size="medium"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />

              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                size="medium"
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
              />

              <TextField
                label="Contraseña"
                variant="outlined"
                fullWidth
                size="medium"
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
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

              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>
              )}

              {/* ── ¿Ya tienes cuenta? ── */}
              <p className="register-login-link">
                ¿Ya tienes una cuenta?{" "}
                <span
                  className="register-login-link-action"
                  onClick={() => navigate("/login")}
                >
                  Inicia sesión aquí
                </span>
              </p>

              <p className="register-login-link">
                ¿Quieres ser profesor?{" "}
                <span
                  className="register-login-link-action"
                  onClick={() => navigate("/solicitud-profesor")}
                >
                  Manda tu solicitud aquí
                </span>
              </p>

              {/* ── Términos y condiciones ── */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    sx={{ color: "var(--color-primary)" }}
                  />
                }
                label="Acepto los términos y condiciones de uso"
              />

              {/* ── Google ── */}
              <Button
                label="Regístrate con Google"
                variant="icon-text"
                color="primary"
                size="medium"
                icon={<GoogleIcon />}
                disabled={true}
              />

              {/* ── Botón principal ── */}
              <Button
                label={loading ? "Cargando..." : "Registrarse"}
                variant="contained"
                color="primary"
                size="large"
                disabled={!acceptTerms || loading}
                onClick={handleRegister}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
