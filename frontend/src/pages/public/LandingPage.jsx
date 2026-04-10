import React from "react";
import Button from "../../components/ui/Button/Button.jsx";
import NavBar from "../../components/ui/NavBar/NavBar.jsx";

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
      {/* TODO: implementar landing pública de DanceLearn Academy */}
    </div>
  );
};

export default LandingPage;
