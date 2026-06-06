import "./NavBarV2.css";
import { NavLink } from "react-router-dom";

/**
 * component that represents a simple navigation bar
 * @param {Array<{label: string, to: string}>} items - An array of objects that define the links.
 * @param {string} fontSize - Font size using global variables (e.g. "--font-size-md").
 * @param {string} className - Additional CSS Classes.
 * @returns {JSX.Element} A navigation element with links managed by NavLink.
 */
const NavBar = ({
  items = [],
  fontSize = "--font-size-md",
  className = "",
}) => {
  return (
    <nav className={`nav ${className}`}>
      {items.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          style={{ fontSize: `var(${fontSize})` }}
          className={({ isActive }) =>
            isActive ? "nav-item nav-item-active" : "nav-item"
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar;
