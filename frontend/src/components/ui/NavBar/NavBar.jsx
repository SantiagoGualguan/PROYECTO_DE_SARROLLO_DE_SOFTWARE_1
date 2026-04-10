import "./NavBar.css";
import { NavLink } from "react-router-dom";
/**
 * component that represents a simple navigation bar
 * @param {Array<{label: string, to: string}>} items -An array of objects that define the links.
 * -Each object must contain a label (label) and a destination path (to).
 * @param {string}  -Additional CSS Classes.
 * @returns {JSX.Element} -A navigation element with links managed by NavLink.
 */
const NavBar = ({ items = [], className = "" }) => {
  return (
    <nav className={`flex items-center gap-8 bg-transparent ${className}`}>
      {items.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
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
