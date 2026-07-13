import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { SalesService } from "../../api/salesService";

const steps = ["Revisar Items", "Datos de Facturación", "Pago y Confirmar"];

const CheckoutWizard = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, refreshCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [billing, setBilling] = useState({
    email_address: "",
    titular_name: "",
    document_number: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [paymentMethod, setPaymentMethod] = useState("pse");

  const handleBillingChange = (field) => (e) => {
    setBilling((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isBillingValid = () => {
    return (
      billing.email_address.trim() &&
      billing.titular_name.trim() &&
      billing.document_number.trim()
    );
  };

  const handleNext = () => {
    if (activeStep === 0 && items.length === 0) return;
    if (activeStep === 1 && !isBillingValid()) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await SalesService.createPurchase({
        payment_method: paymentMethod,
        email_address: billing.email_address,
        titular_name: billing.titular_name,
        document_number: billing.document_number,
        details: `Compra de ${items.length} coreografía(s)`,
      });
      await clearCart();
      navigate("/mis-compras", {
        state: { success: "¡Compra realizada exitosamente!" },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Error al procesar la compra");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && activeStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card
          sx={{ borderRadius: 3, p: 6, textAlign: "center", maxWidth: 500 }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No hay items en el carrito
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/carrito")}
          >
            Volver al Carrito
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={false}
        navItems={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
        ]}
        menuItems={[
          { label: "Catalogo", to: "/catalogo" },
          { label: "Mi Carrito", to: "/carrito" },
          { label: "Mis compras", to: "/mis-compras" },
          { label: "Mi perfil", to: "/perfil" },
        ]}
        rightActions={[
          {
            label: "mi perfil",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/perfil"),
          },
          {
            label: "salir",
            variant: "outlined",
            color: "error",
            icon: <LogoutIcon />,
            onClick: handleLogout,
          },
        ]}
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1a1a2e",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Checkout
          </Typography>
        </div>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Items en tu Carrito
              </Typography>
              {items.map((item, idx) => (
                <React.Fragment key={item.cart_item_id}>
                  {idx > 0 && <Divider sx={{ my: 1 }} />}
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center shrink-0">
                        <Typography
                          variant="body2"
                          sx={{ color: "#e5598f", fontWeight: 700 }}
                        >
                          {item.coreography?.c_name?.charAt(0) || "?"}
                        </Typography>
                      </div>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.coreography?.c_name || "Coreografía"}
                      </Typography>
                    </div>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      $
                      {parseFloat(item.unit_price || 0).toLocaleString("es-CO")}
                    </Typography>
                  </div>
                </React.Fragment>
              ))}
              <Divider sx={{ my: 2 }} />
              <div className="flex justify-between items-center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#e5598f" }}
                >
                  ${total.toLocaleString("es-CO")}
                </Typography>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Datos de Facturación
              </Typography>
              <div className="flex flex-col gap-4">
                <TextField
                  label="Correo Electrónico"
                  type="email"
                  fullWidth
                  required
                  size="small"
                  value={billing.email_address}
                  onChange={handleBillingChange("email_address")}
                  placeholder="correo@ejemplo.com"
                />
                <TextField
                  label="Nombre del Titular"
                  fullWidth
                  required
                  size="small"
                  value={billing.titular_name}
                  onChange={handleBillingChange("titular_name")}
                  placeholder="Nombre y Apellido"
                />
                <TextField
                  label="Número de Documento"
                  fullWidth
                  required
                  size="small"
                  value={billing.document_number}
                  onChange={handleBillingChange("document_number")}
                  placeholder="1234567890"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Método de Pago
              </Typography>

              <FormControl component="fieldset">
                <FormLabel component="legend">
                  Selecciona un método de pago
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="pse"
                    control={<Radio />}
                    label="PSE (Débito desde cuenta bancaria)"
                  />
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label="Tarjeta de Crédito/Débito"
                  />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Resumen</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items: {items.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Titular: {billing.titular_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {billing.email_address}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <div className="flex justify-between items-center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total a Pagar
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#e5598f" }}
                >
                  ${total.toLocaleString("es-CO")}
                </Typography>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-4">
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate("/carrito") : handleBack}
            disabled={submitting}
          >
            {activeStep === 0 ? "Volver al Carrito" : "Atrás"}
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={activeStep === 1 && !isBillingValid()}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Procesando..." : "Confirmar y Pagar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutWizard;
