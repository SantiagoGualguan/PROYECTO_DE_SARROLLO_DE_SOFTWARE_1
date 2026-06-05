import { Button, IconButton, ButtonBase } from "@mui/material";

/**
 * ButtonV2 — Unified button component using Material UI.
 *
 * @param {string}    label    - Button text.
 * @param {element}   icon     - Icon element (optional).
 * @param {string}    variant  - "contained" | "outlined" | "text" | "icon" | "icon-square" | "icon-text".
 * @param {string}    size     - "small" | "medium" | "large".
 * @param {string}    color    - "primary" | "secondary" | "peach" (colores de la paleta).
 * @param {boolean}   disabled - Disables the button.
 * @param {function}  onClick  - Click handler.
 * @param {string}    className - Extra CSS classes.
 */

const ButtonV2 = ({
  label,
  icon,
  variant = "contained",
  size = "medium",
  color = "primary",
  disabled = false,
  onClick,
  className = "",
}) => {
  // ── Variant: icon (circular) ──
  if (variant === "icon") {
    return (
      <IconButton
        size={size}
        color={color}
        disabled={disabled}
        onClick={onClick}
        className={className}
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
          color: `${color}.main`, // lee de la paleta
          borderRadius: "var(--radius-md)",
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
      size={size}
      color={color} // MUI lee directamente de la paleta
      disabled={disabled}
      onClick={onClick}
      className={className}
      startIcon={variant === "icon-text" ? icon : undefined}
      sx={{
        borderRadius: "var(--radius-full)",
      }}
    >
      {label}
    </Button>
  );
};

export default ButtonV2;
