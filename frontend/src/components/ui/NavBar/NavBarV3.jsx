import "./NavBarV3.css";
import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**
 * component that represents a simple navigation bar
 * @param {Array<{label: string, to: string}>} items - An array of objects that define the links.
 * @param {string}  fontSize    - Font size using global variables (e.g. "--font-size-md").
 * @param {boolean} collapsible - If true, collapses into a dropdown when there is no space.
 * @param {string}  className   - Additional CSS Classes.
 * @returns {JSX.Element} A navigation element with links managed by NavLink.
 */
const NavBar = ({
  items = [],
  fontSize = "--font-size-md",
  collapsible = false,
  className = "",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!collapsible) {
    return (
      <nav className={`nav ${className}`}>
        <div className="nav-items">
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
        </div>
      </nav>
    );
  }

  // ── Versión desplegable ──
  return (
    <nav className={`nav nav--dropdown ${className}`}>
      <button
        className="nav-dropdown-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {dropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </button>

      {dropdownOpen && (
        <div className="nav-dropdown-menu">
          {items.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              style={{ fontSize: `var(${fontSize})` }}
              onClick={() => setDropdownOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "nav-dropdown-item nav-dropdown-item--active"
                  : "nav-dropdown-item"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
