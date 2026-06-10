import "./Button.css";
/**
 * Reusable button component based on Material Design 3.
 * @param {string}   label     - Button text.
 * @param {element}  icon      - Button icon (optional).
 * @param {string}   variant   - variant: "filled" | "outlined" | "icon-round" | "icon-square" | "icon-text".
 * @param {string}   size      - size: "small" | "medium" | "large".
 * @param {string}   color     - Background color.
 * @param {boolean}  disabled  - Disable the button if it is true.
 * @param {function} onClick   - Function that is executed when you click.
 * @param {string}   className - Additional CSS Classes.
 * @returns {JSX.Element} Stylish button.
 */

const Button = ({
  label,
  icon,
  variant = "filled",
  size = "medium",
  color = "--color-primary",
  disabled = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={{ backgroundColor: color }}
    >
      <span className="btn__state-layer">
        {icon && <span className="btn--icon">{icon}</span>}
        {label && <span className="btn__label">{label}</span>}
      </span>
    </button>
  );
};

export default Button;
