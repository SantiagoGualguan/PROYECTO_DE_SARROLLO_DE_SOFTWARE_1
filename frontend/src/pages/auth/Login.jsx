import React, { useState, useRef } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { Turnstile } from "@marsidev/react-turnstile";
import { AuthService } from "../../api/authService.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    correo: "",
    phone: "",
    password: "",
  });

  const turnstileRef = useRef(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleCaptchaReset = () => {
    setCaptchaToken(null);
    setCaptchaKey((prev) => prev + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({
        identifier: form.correo || form.phone,
        password: form.password,
        captcha_token: captchaToken,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Credenciales incorrectas. Intenta de nuevo."
      );

      handleCaptchaReset();
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

            <div className="login-header">
              <p className="login-logo">
                <span className="login-logo-dance">Dance</span>
                <span className="login-logo-learn">Learn</span>
              </p>
              <h1 className="login-title">Inicio de sesión</h1>
            </div>

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
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <p style={{ color: "red", fontSize: "0.875rem" }}>
                  {error}
                </p>
              )}

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

              <div className="login-captcha">
                <Turnstile
                  key={captchaKey}
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

              <Button
                label="Inicia sesión con Google"
                variant="icon-text"
                color="primary"
                size="medium"
                icon={<GoogleIcon />}
              />

              <Button
                label={loading ? "Cargando..." : "SIGUIENTE"}
                variant="contained"
                color="primary"
                size="large"
                disabled={!captchaToken || loading}
                onClick={handleLogin}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;