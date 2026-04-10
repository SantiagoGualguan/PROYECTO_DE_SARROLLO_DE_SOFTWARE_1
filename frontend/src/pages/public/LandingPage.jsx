import React from "react";
import Button from "../../components/ui/Button/Button.jsx";

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
      {/* TODO: implementar landing pública de DanceLearn Academy */}
    </div>
  );
};

export default LandingPage;
