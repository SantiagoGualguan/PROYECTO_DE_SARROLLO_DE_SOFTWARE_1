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
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Header
        showMenu={false}
        showFullLogo={true}
        showSearch={false}
        rightActions={[
          {
            label: "Regístrate",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/registro"),
          },
        ]}
      />
      <div className="container login-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* ── Logo y título ── */}
            <div className="login-header">
              <p className="login-logo">
                <span className="login-logo-dance">Dance</span>
                <span className="login-logo-learn">Learn</span>
              </p>
              <h1 className="login-title">Inicio de sesión</h1>
            </div>

            {/* ── Formulario ── */}
            <div className="login-form">
              <TextField
                label="Correo electrónico"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                size="medium"
                type="email"
              />
              <TextField
                label="Contraseña"
                name="password"
                value={form.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                size="medium"
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

              {/* ── Links ── */}
              <div className="login-links">
                <p className="login-link">
                  ¿Aún no tienes cuenta?{" "}
                  <span
                    className="login-link-action"
                    onClick={() => navigate("/registro")}
                  >
                    Crea tu cuenta aquí
                  </span>
                </p>
                <p className="login-link">
                  ¿Has olvidado tu contraseña?{" "}
                  <span className="login-link-action">
                    Recordar contraseña aquí
                  </span>
                </p>
              </div>
              {/* ── Google ── */}
              <div className="login-captcha">
                <ReCAPTCHA
                  sitekey="6LeSCCktAAAAADTbRl3EsqeSU6TZ6UZqTCnpFPjE"
                  onChange={(token) => setCaptchaToken(token)}
                />
              </div>

              <Button
                label="Inicia sesión con Google"
                variant="icon-text"
                color="primary"
                size="medium"
                icon={<GoogleIcon />}
              />

              {/* ── Botón principal ── */}
              <Button
                label="SIGUIENTE"
                variant="contained"
                color="primary"
                size="large"
                disabled={!captchaToken}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
