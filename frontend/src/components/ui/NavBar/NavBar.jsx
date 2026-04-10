import "./NavBar.css";
import { NavLink } from "react-router-dom";

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
