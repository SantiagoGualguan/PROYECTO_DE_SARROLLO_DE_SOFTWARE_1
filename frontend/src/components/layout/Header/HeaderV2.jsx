import "./HeaderV2.css";
import NavBar from "../../ui/NavBar/NavBarV3";
import SearchBar from "../../ui/SearchBar/SearchBar";
import Button from "../../ui/Button/ButtonV2";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState, useRef, useEffect } from "react";
const HeaderV2 = ({
  showMenu = false,
  showFullLogo = true,
  navItems = [],
  showSearch = false,
  rightActions = [],
  className = "",
}) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false); // búsqueda fullscreen móvil
  const [navCollapsed, setNavCollapsed] = useState(false);
  const hiddenNavRef = useRef(null);
  const navCollapsedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const headerCenterRef = useRef(null);
  const headerRef = useRef(null);
  const headerLeftRef = useRef(null);
  const headerActionsRef = useRef(null);
  const lastCenterWidthRef = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!navItems.length) return;

    const observer = new ResizeObserver(() => {
      if (
        hiddenNavRef.current &&
        headerRef.current &&
        headerLeftRef.current &&
        headerActionsRef.current
      ) {
        const itemsWidth = hiddenNavRef.current.scrollWidth;

        // calcula el espacio disponible de forma estable
        // el header siempre tiene el mismo ancho, y left/actions nunca cambian
        const headerWidth = headerRef.current.offsetWidth;
        const leftWidth = headerLeftRef.current.offsetWidth;
        const actionsWidth = headerActionsRef.current.offsetWidth;
        const padding = 48; // 2 * space-xl
        const gaps = 48; // gaps entre los 3 bloques

        // espacio disponible para navbar + searchbar juntos
        const centerWidth =
          headerWidth - leftWidth - actionsWidth - padding - gaps;

        // espacio para el navbar = centro menos el searchbar mínimo
        const searchMinWidth = 150; // ancho mínimo razonable del searchbar
        const availableForNav = centerWidth - searchMinWidth - 16; // 16 = gap entre navbar y searchbar

        const shouldCollapse = itemsWidth > availableForNav;

        if (shouldCollapse !== navCollapsedRef.current) {
          navCollapsedRef.current = shouldCollapse;
          setNavCollapsed(shouldCollapse);
        }
      }
    });

    if (headerRef.current) observer.observe(headerRef.current);

    return () => observer.disconnect();
  }, [navItems]);

  const renderedActions = Array.isArray(rightActions)
    ? rightActions.map(({ label, variant, color, onClick, icon }) => (
        <Button
          key={label}
          label={label}
          variant={variant}
          color={color}
          icon={icon}
          size={isMobile ? "small" : "medium"}
          onClick={onClick}
        />
      ))
    : rightActions;

  return (
    <>
      <header ref={headerRef} className={`header ${className}`}>
        {/* ── Izquierda: menu + logo ── */}
        <div ref={headerLeftRef} className="header_left">
          <div className="header_menu">
            {showMenu && (
              <Button
                icon={<MenuIcon />}
                variant="icon-square"
                size={isMobile ? "small" : "medium"}
                color="primary"
              />
            )}
          </div>
          <div className="header_logo" onClick={() => navigate("/")}>
            <img className="header_logo-img" src={logo} alt="DanceLearn logo" />
            {/* En móvil se oculta el texto, en desktop depende de showFullLogo */}
            {showFullLogo && (
              <p className="header_logo-text">
                <span className="header_logo-dance">Dance</span>
                <span className="header_logo-learn">Learn</span>
              </p>
            )}
          </div>
        </div>
        {/* ── Centro: navbar + searchbar ── */}
        <div
          ref={headerCenterRef}
          className={`header_center ${navCollapsed || isMobile ? "header_center--collapsed" : ""}`}
        >
          {/* NavBar desktop — se oculta en móvil */}
          {navItems.length > 0 && (
            <div className="header_navbar">
              {/* Mide el ancho real de los items — siempre en el DOM, siempre invisible */}
              <div ref={hiddenNavRef} className="header_navbar-hidden">
                {navItems.map(({ label }) => (
                  <span key={`hidden-${label}`} className="nav-item">
                    {label}
                  </span>
                ))}
              </div>
              {/* NavBar recibe collapsible según lo que calculó el Header */}
              <NavBar
                items={navItems}
                fontSize="--font-size-md"
                collapsible={navCollapsed || isMobile} // ← Header decide, NavBar solo renderiza
              />
            </div>
          )}

          {/* SearchBar desktop — se oculta en móvil */}
          {showSearch && (
            <div className="header_searchbar">
              <SearchBar placeholder="¿Qué quieres aprender?" width="100%" />
            </div>
          )}

          {/* Botón lupa — solo visible en móvil */}
          {showSearch && (
            <button
              className="search-mobile-btn"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
          )}
        </div>
        {/* ── Derecha: actions ── */}
        <div ref={headerActionsRef} className="header_actions">
          <div className="header_actions-wrapper">{renderedActions}</div>
        </div>
      </header>

      {/* ── Búsqueda fullscreen móvil ── */}
      {searchOpen && (
        <div className="search-fullscreen">
          <button
            className="search-fullscreen-close"
            onClick={() => setSearchOpen(false)}
          >
            ✕
          </button>
          <SearchBar placeholder="¿Qué quieres aprender?" width="100%" />
        </div>
      )}
    </>
  );
};

export default HeaderV2;
