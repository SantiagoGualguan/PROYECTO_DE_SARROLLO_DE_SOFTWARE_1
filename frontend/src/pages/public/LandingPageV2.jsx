import { useNavigate } from "react-router-dom";
import ButtonV2 from "../../components/ui/Button/Button";
import StarIcon from "@mui/icons-material/Star";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
//import NavBarV2 from "../../components/ui/NavBar/NavBarV2";
import NavBar from "../../components/ui/NavBar/NavBar";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import { blue } from "@mui/material/colors";
import Header from "../../components/layout/Header/Header";
import HeroSection from "./LandingPage/sections/HeroSection";
import DescriptionSection from "./LandingPage/sections/DescriptionSection";
import FeatureSection from "./LandingPage/sections/FeaturesSection";
import PreviewSection from "./LandingPage/sections/PreviewSection";
import GenresSection from "./LandingPage/sections/GenresSection";
import TeacherSection from "./LandingPage/sections/TeacherSection";
import Footer from "../../components/layout/Footer/Footer";
import sideBarMenu from "../../components/layout/SidebarMenu/SidebarMenu";
import CoreografiaCarrusel from "../../components/common/CoreografiaCarrusel";
import { coreografiasMock } from "../../components/common/CoreografiasMock";
import coreografias from "./Catalog/Coreografias";

const LandingV2 = () => {
  const navigate = useNavigate();
  const coreografias = coreografiasMock.slice(0, 8);
  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        navItems={[
          { label: "Coreografías", to: "/catalogo" },
          { label: "Profesores", to: "/profesores" },
          { label: "Coreografíass", to: "/" },
        ]}
        showSearch={true}
        rightActions={[
          {
            label: "Inicia sesión",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/login"),
          },
          {
            label: "Regístrate",
            variant: "contained",
            color: "primary",
            onClick: () => navigate("/register"),
          },
        ]}
      ></Header>

      <div className="container py-4">
        <CoreografiaCarrusel
          titulo="Coreografías destacadas"
          coreografias={coreografias}
          onVerTodos={() => navigate("/catalogo")}
        />
      </div>
      <coreografias></coreografias>
      <Footer></Footer>
    </div>
  );
};

export default LandingV2;
