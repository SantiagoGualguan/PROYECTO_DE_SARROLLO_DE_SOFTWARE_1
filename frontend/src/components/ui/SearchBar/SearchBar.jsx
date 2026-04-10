import { useState } from "react";
import "./SearchBar.css";
import lupaIcon from "../../../assets/icons/search.png";
import cerrarIcon from "../../../assets/icons/X.png";
/**
 * Component that represents a search bar
 * @param {function} onSearch    -search function
 * @param {string}   placeholder
 * @param {string} className   Additional CSS Classes.
 * @returns  {JSX.Element} Search Bar.
 */

const SearchBar = ({ onSearch, placeholder = "Buscar...", className = "" }) => {
  const [query, setQuery] = useState("");

  // Handles the change in the input
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value); // Notifica al componente padre
  };

  // Clear the search engine
  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div
      className={`search-container ${query ? "filled" : "placeholder"} ${className}`}
    >
      <input
        type="text"
        className="search-input"
        value={query}
        placeholder={placeholder}
        onChange={handleChange}
      />

      {query && (
        <button
          className="clear-button"
          onClick={handleClear}
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <img src={cerrarIcon} alt="Limpiar" className="icon-img" />
        </button>
      )}

      <div className="search-icon-wrapper">
        <img src={lupaIcon} alt="Buscar" className="icon-img" />
      </div>
    </div>
  );
};

export default SearchBar;
