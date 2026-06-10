import "./Header.css";
import NavBar from "../../ui/NavBar/NavBar";
import SearchBar from "../../ui/SearchBar/SearchBar";
import Button from "../../ui/Button/Button";
import MenuIcon from "../../../assets/icons/menu.png";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";

/**
 * Componente reutilizable de encabezado.
 * @param {boolean}     showMenu      - Show the hamburger menu button.
 * @param {boolean}     showFullLogo  - Muestra logo + nombre. Si es false, solo el logo.
 * @param {Array}       navItems      -  Items del NavBar [{ label, to }].
 * @param {boolean}     showSearch    - Displays the search bar.
 * @param {JSX.Element} rightActions  - Buttons on the right side.
 * @param {string}      className     - Additional CSS classes.
 * @returns {JSX.Element} Application header.
 */
const Header = ({
  showMenu = false,
  showFullLogo = true,
  navItems = [],
  showSearch = false,
  rightActions = null,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <header className={`header ${className}`}>
      <div className="header__left">
        {showMenu && (
          <Button
            icon={<img src={MenuIcon} alt="menú" width="20px" />}
            variant="icon-square"
            size="large"
            color="var(--color-primary)"
            onClick={() => {}}
          />
        )}
        <div className="header__logo" onClick={() => navigate("/")}>
          <img className="header__logo-img" src={logo} alt="DanceLearn logo" />
          {showFullLogo && (
            <p className="header__logo-text">
              <span className="header__logo-dance">Dance</span>
              <span className="header__logo-learn">Learn</span>
            </p>
          )}
        </div>
      </div>
      {navItems.length > 0 && (
        <div className="header__center">
          <NavBar items={navItems} />
        </div>
      )}

      <div className="header__right">
        {showSearch && <SearchBar placeholder="¿Que quieres aprender?" />}
        {rightActions && <div className="header__actions">{rightActions}</div>}
      </div>
    </header>
  );
};

export default Header;
