import { Button, IconButton, ButtonBase } from "@mui/material";

const resolveColor = (color) => {
  if (!color) return "var(--color-primary)";
  if (color.startsWith("--")) return `var(${color})`;
  return color;
};

const ButtonV2 = ({
  label,
  icon,
  variant = "contained",
  size = "medium",
  color = "--color-primary",
  disabled = false,
  onClick,
  className = "",
}) => {
  const resolvedColor = resolveColor(color);

  const baseStyles = {
    fontFamily: "var(--font-button)",
    fontWeight: 500,
    letterSpacing: "0.15px",
    textTransform: "none",
    transition: "opacity 0.2s ease",
    "&.Mui-disabled": {
      backgroundColor: "var(--color-disabled-bg)",
      color: "var(--color-text-disabled)",
      opacity: 0.38,
    },
  };

  // ── Variant: icon (circular) ──
  if (variant === "icon") {
    return (
      <IconButton
        size={size} // ← inherit | small | medium | large
        disabled={disabled}
        onClick={onClick}
        className={className}
        sx={{
          ...baseStyles,
          backgroundColor: resolvedColor,
          color: "var(--color-text-on-button)",
          borderRadius: "var(--radius-full)",
          "&:hover": { backgroundColor: resolvedColor, opacity: 0.92 },
          "&.Mui-disabled": { ...baseStyles["&.Mui-disabled"] },
        }}
      >
        {icon}
      </IconButton>
    );
  }

  // ── Variant: icon-square ──
  if (variant === "icon-square") {
    return (
      <ButtonBase
        disabled={disabled}
        onClick={onClick}
        className={className}
        sx={{
          ...baseStyles,
          backgroundColor: resolvedColor,
          color: "var(--color-text-on-button)",
          borderRadius: "var(--radius-md)",
          // ButtonBase no tiene size nativo, pero puedes usar estas clases de MUI:
          fontSize:
            size === "small"
              ? "var(--font-size-xs)"
              : size === "large"
                ? "var(--font-size-md)"
                : "var(--font-size-sm)",
          padding:
            size === "small"
              ? "var(--space-sm)"
              : size === "large"
                ? "var(--space-lg)"
                : "var(--space-md)",
          "&:hover": { backgroundColor: resolvedColor, opacity: 0.92 },
          "&.Mui-disabled": { ...baseStyles["&.Mui-disabled"] },
        }}
      >
        {icon}
      </ButtonBase>
    );
  }

  // ── Variants: contained | outlined | text | icon-text ──
  return (
    <Button
      variant={variant === "icon-text" ? "contained" : variant}
      size={size} // ← small | medium | large — MUI maneja las dimensiones
      disabled={disabled}
      onClick={onClick}
      className={className}
      startIcon={variant === "icon-text" ? icon : undefined}
      sx={{
        ...baseStyles,
        borderRadius: "var(--radius-full)",

        ...((variant === "contained" || variant === "icon-text") && {
          backgroundColor: resolvedColor,
          color: "var(--color-text-on-button)",
          "&:hover": { backgroundColor: resolvedColor, opacity: 0.92 },
        }),

        ...(variant === "outlined" && {
          backgroundColor: "transparent",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-text-primary)",
          borderWidth: "2px",
          "&:hover": {
            backgroundColor: "var(--color-hover-overlay)",
            borderColor: "var(--color-text-primary)",
            borderWidth: "2px",
          },
        }),

        ...(variant === "text" && {
          backgroundColor: "transparent",
          color: resolvedColor,
          "&:hover": { backgroundColor: "var(--color-hover-overlay)" },
        }),
      }}
    >
      {label}
    </Button>
  );
};

export default ButtonV2;
