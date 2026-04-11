import React from "react";
import Button from "../../../components/ui/Button/Button.jsx";
import NavBar from "../../../components/ui/NavBar/NavBar.jsx";
import SearchBar from "../../../components/ui/SearchBar/SearchBar.jsx";
import Header from "../../../components/layout/Header/Header.jsx";
import HeroSection from "./sections/HeroSection.jsx";
import DescriptionSection from "./sections/DescriptionSection.jsx";
import FeatureSection from "./sections/FeaturesSection.jsx";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ gap: "30px", display: "flex", flexDirection: "column" }}>
      <Header
        showMenu={false}
        showFullLogo={true}
        navItems={[
          { label: "Coreografías", to: "/catalogo" },
          { label: "Profesores", to: "/profesores" },
        ]}
        showSearch={true}
        rightActions={
          <>
            <Button
              label="Inicia sesión"
              variant="filled"
              size="medium"
              color="var(--color-primary)"
              onClick={() => navigate("/login")}
            />
            <Button
              label="Regístrate"
              variant="filled"
              size="medium"
              color="var(--color-primary)"
              onClick={() => navigate("/registro")}
            />
          </>
        }
      />
      <HeroSection />
      <DescriptionSection />
      <FeatureSection />
    </div>
  );
};

export default LandingPage;
