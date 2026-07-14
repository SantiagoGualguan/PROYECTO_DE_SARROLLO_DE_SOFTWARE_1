// src/pages/sales/PurchaseHistory.jsx
//
// "Mis Compras" — ya no es una tabla de facturas, ahora muestra una grilla de
// CoreografiaCard con cada coreografía que el usuario compró. Cada tarjeta
// ya trae género y dificultad (los pinta CoreografiaCard), y le agregamos
// debajo la fecha de compra y el precio pagado, que CoreografiaCard no
// muestra por diseño (esa tarjeta es genérica y se usa también en el
// catálogo).
//
// ─── De dónde sale cada dato ────────────────────────────────────────────────
// SalesService.getPurchaseHistory()  → GET /sales/
//   Devuelve las compras del usuario. Cada compra trae `items`, y cada item
//   referencia una coreografía — pero salesService.js no documenta la forma
//   exacta del campo (anidado item.coreography.{...} o plano
//   item.coreography_id / item.coreography_name / item.unit_price), así que
//   `normalizarItemCompra` soporta ambas formas para no romperse si cambia.
//
// CoreografiaCard necesita el objeto COMPLETO de la coreografía
// (image_url, dificulty_level, song_genre, price), y el historial de compras
// típicamente no trae eso completo (o no se puede garantizar). Por eso, una
// vez que sabemos qué coreography_id se compraron, pedimos el detalle real
// de cada una con:
//
// CoreographyService.getById(id) → GET /choreographies/{id}/
//   Este sí está confirmado y es el mismo que ya usa CoreografiaDetail.jsx,
//   así que reuso el mismo adaptador `normalizarCoreografia` que ya tenías
//   ahí, campo por campo, sin inventar nombres nuevos.
//
// Si una coreografía fue eliminada (soft-delete → status "inactive") o el
// getById falla, no reventamos la grilla: esa compra se muestra con una
// tarjeta simple de "ya no disponible" en vez de la CoreografiaCard.

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header/Header.jsx";
import Footer from "../../components/layout/Footer/Footer.jsx";
import CoreografiaCard from "../../components/common/CoreografiaCard.jsx";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import { SalesService } from "../../api/salesService";
import { CoreographyService } from "../../api/choreographyService";

// Mismo adaptador que usa CoreografiaDetail.jsx — nombres tomados del DDL
// real, no del PDF. Lo repito acá en vez de importarlo porque no vive en un
// módulo compartido; si quieres lo movemos a un util común.
const normalizarCoreografia = (raw) => ({
  coreography_id: raw.coreography_id,
  c_name: raw.c_name ?? "",
  image_url: raw.image_url ?? "",
  dificulty_level: raw.dificulty_level ?? null,
  song_genre: raw.song_genre ?? null,
  price: Number(raw.price ?? 0),
});

// GET /sales/ no está documentado con precisión, así que soportamos tanto
// arreglo plano como el objeto paginado de DRF { count, results }.
const normalizePurchaseHistory = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
};

// Aplana cada item de cada compra en una fila independiente
// { coreographyId, coreographyName, purchaseDate, pricePaid, key }.
// Soporta forma anidada (item.coreography.coreography_id) y plana
// (item.coreography_id) por la misma razón que arriba.
const normalizarItemCompra = (item, purchase, fallbackKey) => {
  const coreographyId =
    item?.coreography?.coreography_id ?? item?.coreography_id ?? null;
  const coreographyName =
    item?.coreography?.c_name ?? item?.coreography_name ?? "Coreografía";
  const pricePaid =
    item?.unit_price ?? item?.coreography?.price ?? item?.price ?? null;

  return {
    key: item?.id ?? coreographyId ?? fallbackKey,
    coreographyId,
    coreographyName,
    purchaseDate: purchase?.purchase_date ?? null,
    pricePaid,
  };
};

const formatearFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined || Number.isNaN(Number(precio)))
    return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(precio));
};

const UserPurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [comprasCoreografias, setComprasCoreografias] = useState([]);
  const [coreografiasPorId, setCoreografiasPorId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const successMsg = location.state?.success;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      let items = [];
      try {
        const res = await SalesService.getPurchaseHistory();
        const purchases = normalizePurchaseHistory(res.data);
        items = purchases.flatMap((p, pIdx) =>
          (p.items || []).map((item, iIdx) =>
            normalizarItemCompra(item, p, `${p.purchase_id ?? pIdx}-${iIdx}`),
          ),
        );
      } catch {
        if (!cancelado) {
          setError("Error al cargar el historial");
          setLoading(false);
        }
        return;
      }

      if (cancelado) return;
      setComprasCoreografias(items);

      // Trae el detalle completo (imagen, género, dificultad, precio actual)
      // de cada coreografía distinta que aparece en el historial.
      const idsUnicos = [
        ...new Set(items.map((i) => i.coreographyId).filter(Boolean)),
      ];

      const resultados = await Promise.allSettled(
        idsUnicos.map((id) => CoreographyService.getById(id)),
      );

      if (cancelado) return;

      const mapa = {};
      idsUnicos.forEach((id, idx) => {
        const r = resultados[idx];
        if (r.status === "fulfilled") {
          mapa[id] = normalizarCoreografia(r.value.data);
        }
      });
      setCoreografiasPorId(mapa);
      setLoading(false);
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
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
          { label: "historial de compras", to: "/mi-historial-de-compras" },
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
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
            Mis Compras
          </Typography>
        </div>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {comprasCoreografias.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <ReceiptIcon
              sx={{ fontSize: "4rem", color: "#e5598f", opacity: 0.4, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No tienes compras registradas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explora nuestro catálogo y adquiere tu primera coreografía.
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comprasCoreografias.map((compra) => {
              const coreografia = compra.coreographyId
                ? coreografiasPorId[compra.coreographyId]
                : null;
              const precioFormateado = formatearPrecio(compra.pricePaid);

              if (!coreografia) {
                // La coreografía ya no existe / está inactiva / falló su
                // detalle: no hay datos para armar una CoreografiaCard real.
                return (
                  <div
                    key={compra.key}
                    className="rounded-2xl border border-dashed border-gray-300 p-4 flex flex-col gap-1 bg-white"
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {compra.coreographyName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ya no está disponible
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Comprada el {formatearFecha(compra.purchaseDate)}
                    </Typography>
                  </div>
                );
              }

              return (
                <div key={compra.key} className="flex flex-col gap-2">
                  <CoreografiaCard coreografia={coreografia} />
                  <div className="flex items-center justify-between px-1">
                    <Typography variant="caption" color="text.secondary">
                      Comprada el {formatearFecha(compra.purchaseDate)}
                    </Typography>
                    {precioFormateado && (
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#e5598f" }}
                      >
                        Pagaste {precioFormateado}
                      </Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserPurchase;
