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
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

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
              />
              <TextField
                label="Apellidos"
                variant="outlined"
                fullWidth
                size="medium"
              />

              <TextField
                label="Número de teléfono"
                variant="outlined"
                fullWidth
                size="medium"
              />

              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                size="medium"
                type="email"
              />

              <TextField
                label="Contraseña"
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

              {/* ── CAPTCHA ── */}
              <div className="register-captcha">
                <ReCAPTCHA
                  sitekey="6LeSCCktAAAAADTbRl3EsqeSU6TZ6UZqTCnpFPjE"
                  onChange={(token) => setCaptchaToken(token)}
                />
              </div>

              {/* ── Google ── */}
              <Button
                label="Regístrate con Google"
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
                disabled={!acceptTerms || !captchaToken}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
