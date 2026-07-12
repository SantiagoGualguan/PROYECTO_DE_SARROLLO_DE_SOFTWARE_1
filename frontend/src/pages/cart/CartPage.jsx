import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, loading, error, total, removeItem, clearCart, itemCount } = useCart();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMenu={false} showFullLogo={true} showSearch={false}
        navItems={[{ label: "Catalogo", to: "/coreografias" }]}
        rightActions={[
          { label: "mi perfil", variant: "contained", color: "primary", onClick: () => navigate("/perfil") },
        ]}
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Mi Carrito
          </Typography>
          {itemCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Typography>
          )}
        </div>

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        {itemCount === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", p: { xs: 3, sm: 6 }, textAlign: "center" }}>
            <ShoppingCartIcon sx={{ fontSize: "4rem", color: "#e5598f", opacity: 0.4, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Tu carrito está vacío
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Explora nuestro catálogo y encuentra la coreografía perfecta para ti.
            </Typography>
            <Button variant="contained" color="primary" startIcon={<StorefrontIcon />} onClick={() => navigate("/coreografias")}>
              Explorar Catálogo
            </Button>
          </Card>
        ) : (
          <>
            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", mb: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                {items.map((item, idx) => (
                  <React.Fragment key={item.cart_item_id}>
                    {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center shrink-0">
                        <Typography variant="h6" sx={{ color: "#e5598f", fontWeight: 700, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                          {item.coreography?.c_name?.charAt(0) || "?"}
                        </Typography>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", sm: "0.95rem" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.coreography?.c_name || "Coreografía"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${parseFloat(item.unit_price || 0).toLocaleString("es-CO")}
                        </Typography>
                      </div>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.1rem" }, color: "#e5598f", whiteSpace: "nowrap" }}>
                        ${parseFloat(item.unit_price || 0).toLocaleString("es-CO")}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => removeItem(item.cart_item_id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", mb: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${total.toLocaleString("es-CO")}</Typography>
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="flex justify-between items-center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#e5598f" }}>${total.toLocaleString("es-CO")}</Typography>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={clearCart}>
                Vaciar Carrito
              </Button>
              <Button variant="contained" color="primary" size="large" onClick={() => navigate("/checkout")}>
                Proceder al Pago
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
