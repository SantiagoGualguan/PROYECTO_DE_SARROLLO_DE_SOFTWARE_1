import React from "react";
import Button from "../../components/ui/Button/Button.jsx";
import NavBar from "../../components/ui/NavBar/NavBar.jsx";
import SearchBar from "../../components/ui/SearchBar/SearchBar.jsx";

const LandingPage = () => {
  return (
    <div>
      LandingPage yooy
      <Button
        label="Inicia sesión"
        variant="filled"
        size="medium"
        color="var(--color-pink-light)"
        onClick={() => console.log("funciona!")}
      />
      <NavBar
        items={[
          { label: "Dasboard", to: "./" },
          { label: "Dasboard", to: "/LandingPage" },
        ]}
      />
      <div style={{ backgroundColor: "#6c86fd", padding: "10px" }}>
        <SearchBar onSearch={""} />
      </div>
    </div>
  );
};

export default LandingPage;
