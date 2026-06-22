import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Header from "../../components/layout/Header/Header.jsx";
import Button from "../../components/ui/Button/Button.jsx";
import "./TeacherApplication.css";

const GENEROS = ["Salsa", "Cumbia", "Reggaeton", "Bachata", "Hip-hop", "Otro"];
const NIVELES = ["Principiante", "Intermedio", "Avanzado"];
const STEPS = ["Datos personales", "Información profesional"];

const TeacherApplication = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [step1, setStep1] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    password: "",
  });

  const [step2, setStep2] = useState({
    nombreArtistico: "",
    bio: "",
    generosSeleccionados: [],
    otroGenero: "",
    nivel: "",
    aniosExperiencia: "",
    aniosEnsenando: "",
    linkVideo: "",
    linkRedes: "",
    acceptTerms: false,
    confirmInfo: false,
  });

  const handleStep1Change = (e) => {
    const { name, value } = e.target;
    setStep1((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep2Change = (e) => {
    const { name, value, type, checked } = e.target;
    setStep2((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleGenero = (genero) => {
    setStep2((prev) => ({
      ...prev,
      generosSeleccionados: prev.generosSeleccionados.includes(genero)
        ? prev.generosSeleccionados.filter((g) => g !== genero)
        : [...prev.generosSeleccionados, genero],
    }));
  };

  const toggleNivel = (n) => {
    setStep2((prev) => ({ ...prev, nivel: n }));
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

      <div className="container teacher-container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            {/* ── Logo y título ── */}
            <div className="teacher-header">
              <p className="teacher-logo">
                <span className="teacher-logo-dance">Dance</span>
                <span className="teacher-logo-learn">Learn</span>
              </p>
              <h1 className="teacher-title">Solicitud de profesor</h1>
              <p className="teacher-subtitle">
                Únete a nuestro equipo de enseñanza
              </p>
            </div>

            {/* ── Stepper ── */}
            <Stepper
              activeStep={activeStep}
              sx={{ marginBottom: "var(--space-xl)" }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--font-size-xs)",
                      },
                      "& .MuiStepIcon-root.Mui-active": {
                        color: "var(--color-primary)",
                      },
                      "& .MuiStepIcon-root.Mui-completed": {
                        color: "var(--color-primary)",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* ── Paso 1 ── */}
            {activeStep === 0 && (
              <div className="teacher-form">
                <TextField
                  label="Nombres"
                  variant="outlined"
                  fullWidth
                  name="nombres"
                  value={step1.nombres}
                  onChange={handleStep1Change}
                />
                <TextField
                  label="Apellidos"
                  variant="outlined"
                  fullWidth
                  name="apellidos"
                  value={step1.apellidos}
                  onChange={handleStep1Change}
                />
                <TextField
                  label="Número de teléfono"
                  variant="outlined"
                  fullWidth
                  name="telefono"
                  value={step1.telefono}
                  onChange={handleStep1Change}
                />
                <TextField
                  label="Correo electrónico"
                  variant="outlined"
                  fullWidth
                  type="email"
                  name="correo"
                  value={step1.correo}
                  onChange={handleStep1Change}
                />
                <TextField
                  label="Contraseña"
                  variant="outlined"
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={step1.password}
                  onChange={handleStep1Change}
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
                <Button
                  label="SIGUIENTE"
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setActiveStep(1)}
                />
              </div>
            )}

            {/* ── Paso 2 ── */}
            {activeStep === 1 && (
              <div className="teacher-form">
                <TextField
                  label="Nombre artístico"
                  variant="outlined"
                  fullWidth
                  name="nombreArtistico"
                  value={step2.nombreArtistico}
                  onChange={handleStep2Change}
                />
                <TextField
                  label="Biografía corta"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  name="bio"
                  value={step2.bio}
                  onChange={handleStep2Change}
                />

                {/* ── Géneros ── */}
                <div className="teacher-field-group">
                  <p className="teacher-field-label">Géneros de baile</p>
                  <div className="teacher-chips">
                    {GENEROS.map((genero) => (
                      <Chip
                        key={genero}
                        label={genero}
                        onClick={() => toggleGenero(genero)}
                        sx={{
                          backgroundColor: step2.generosSeleccionados.includes(
                            genero,
                          )
                            ? "var(--color-primary)"
                            : "transparent",
                          color: step2.generosSeleccionados.includes(genero)
                            ? "#fff"
                            : "var(--color-text-primary)",
                          border: "1px solid",
                          borderColor: step2.generosSeleccionados.includes(
                            genero,
                          )
                            ? "var(--color-primary)"
                            : "rgba(0,0,0,0.23)",
                          "&:hover": {
                            backgroundColor:
                              step2.generosSeleccionados.includes(genero)
                                ? "var(--color-primary)"
                                : "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    ))}
                  </div>
                  {step2.generosSeleccionados.includes("Otro") && (
                    <TextField
                      label="¿Cuál otro género?"
                      variant="outlined"
                      fullWidth
                      name="otroGenero"
                      value={step2.otroGenero}
                      onChange={handleStep2Change}
                    />
                  )}
                </div>

                {/* ── Nivel ── */}
                <div className="teacher-field-group">
                  <p className="teacher-field-label">Nivel máximo que enseña</p>
                  <div className="teacher-chips">
                    {NIVELES.map((n) => (
                      <Chip
                        key={n}
                        label={n}
                        onClick={() => toggleNivel(n)}
                        sx={{
                          backgroundColor:
                            step2.nivel === n
                              ? "var(--color-primary)"
                              : "transparent",
                          color:
                            step2.nivel === n
                              ? "#fff"
                              : "var(--color-text-primary)",
                          border: "1px solid",
                          borderColor:
                            step2.nivel === n
                              ? "var(--color-primary)"
                              : "rgba(0,0,0,0.23)",
                          "&:hover": {
                            backgroundColor:
                              step2.nivel === n
                                ? "var(--color-primary)"
                                : "rgba(0,0,0,0.04)",
                          },
                        }}
                      />
                    ))}
                  </div>
                </div>

                <TextField
                  label="Años de experiencia bailando"
                  variant="outlined"
                  fullWidth
                  type="number"
                  name="aniosExperiencia"
                  value={step2.aniosExperiencia}
                  onChange={handleStep2Change}
                />
                <TextField
                  label="Años de experiencia enseñando"
                  variant="outlined"
                  fullWidth
                  type="number"
                  name="aniosEnsenando"
                  value={step2.aniosEnsenando}
                  onChange={handleStep2Change}
                />
                <TextField
                  label="Link a video de muestra"
                  variant="outlined"
                  fullWidth
                  placeholder="YouTube, Instagram, TikTok..."
                  name="linkVideo"
                  value={step2.linkVideo}
                  onChange={handleStep2Change}
                />
                <TextField
                  label="Link a redes sociales (opcional)"
                  variant="outlined"
                  fullWidth
                  name="linkRedes"
                  value={step2.linkRedes}
                  onChange={handleStep2Change}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={step2.acceptTerms}
                      name="acceptTerms"
                      onChange={handleStep2Change}
                      sx={{ color: "var(--color-primary)" }}
                    />
                  }
                  label="Acepto los términos y condiciones de uso"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={step2.confirmInfo}
                      name="confirmInfo"
                      onChange={handleStep2Change}
                      sx={{ color: "var(--color-primary)" }}
                    />
                  }
                  label="Confirmo que la información proporcionada es verídica"
                />

                <div className="teacher-actions">
                  <Button
                    label="ATRÁS"
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => setActiveStep(0)}
                  />
                  <Button
                    label="ENVIAR SOLICITUD"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!step2.acceptTerms || !step2.confirmInfo}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherApplication;
