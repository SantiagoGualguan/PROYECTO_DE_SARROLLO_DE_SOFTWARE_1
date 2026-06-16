import ButtonV2 from "../../components/ui/Button/ButtonV2";
import StarIcon from "@mui/icons-material/Star";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
//import NavBarV2 from "../../components/ui/NavBar/NavBarV2";
import NavBar from "../../components/ui/NavBar/NavBar";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import { blue } from "@mui/material/colors";
import HeaderV2 from "../../components/layout/Header/HeaderV2";
import NavBarV3 from "../../components/ui/NavBar/NavBarV3";
import HeroSection from "./LandingPage/sections/HeroSectionV2";
import DescriptionSection from "./LandingPage/sections/DescriptionSectionV2";
import FeatureSection from "./LandingPage/sections/FeaturesSectionV2";
import PreviewSection from "./LandingPage/sections/PreviewSectionV2";
import GenresSection from "./LandingPage/sections/GenresSectionV2";
import TeacherSection from "./LandingPage/sections/TeacherSectionV2";
import Footer from "../../components/layout/Footer/Footer";
const LandingV2 = () => {
  return (
    <div
    /*
        style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "flex-start",
      }} 
      */
    >
      {/* ── Contained ── */}
      <h2>Contained</h2>
      <ButtonV2
        label="Empezar"
        variant="contained"
        size="small"
        color="primary"
      />
      <ButtonV2
        label="Empezar"
        variant="contained"
        size="medium"
        color="primary"
      />
      <ButtonV2
        label="Inicia sesión"
        variant="contained"
        size="large"
        color="primary"
      />
      <ButtonV2
        label="Empezar"
        variant="contained"
        size="medium"
        color="secondary"
      />
      <ButtonV2
        label="Empezar"
        variant="contained"
        size="medium"
        color="peach"
      />

      {/* ── Outlined ── */}
      <h2>Outlined</h2>
      <ButtonV2
        label="Ver más"
        variant="outlined"
        size="small"
        color="primary"
      />
      <ButtonV2
        label="Ver más"
        variant="outlined"
        size="medium"
        color="primary"
      />
      <ButtonV2
        label="Ver más"
        variant="outlined"
        size="large"
        color="primary"
      />
      <ButtonV2
        label="Ver más"
        variant="outlined"
        size="medium"
        color="secondary"
      />

      {/* ── Text ── */}
      <h2>Text</h2>
      <ButtonV2 label="Cancelar" variant="text" size="small" color="primary" />
      <ButtonV2 label="Cancelar" variant="text" size="medium" color="primary" />
      <ButtonV2
        label="Cancelar"
        variant="text"
        size="large"
        color="secondary"
      />

      {/* ── Icon circular ── */}
      <h2>Icon circular</h2>
      <ButtonV2
        variant="icon"
        icon={<StarIcon />}
        size="small"
        color="primary"
      />
      <ButtonV2
        variant="icon"
        icon={<StarIcon />}
        size="medium"
        color="primary"
      />
      <ButtonV2
        variant="icon"
        icon={<StarIcon />}
        size="large"
        color="secondary"
      />

      {/* ── Icon square ── */}
      <h2>Icon square</h2>
      <ButtonV2
        variant="icon-square"
        icon={<MusicNoteIcon />}
        size="small"
        color="primary"
      />
      <ButtonV2
        variant="icon-square"
        icon={<MusicNoteIcon />}
        size="medium"
        color="primary"
      />
      <ButtonV2
        variant="icon-square"
        icon={<MusicNoteIcon />}
        size="large"
        color="secondary"
      />

      {/* ── Icon + Text ── */}
      <h2>Icon + Text</h2>
      <ButtonV2
        label="Explorar"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        size="small"
        color="primary"
      />
      <ButtonV2
        label="Explorar"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        size="medium"
        color="primary"
      />
      <ButtonV2
        label="Explorar"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        size="large"
        color="secondary"
      />

      {/* ── Disabled ── */}
      <h2>Disabled</h2>
      <ButtonV2 label="No disponible" variant="contained" disabled />
      <ButtonV2 label="No disponible" variant="outlined" disabled />
      <ButtonV2 label="No disponible" variant="text" disabled />
      <ButtonV2 variant="icon" icon={<StarIcon />} disabled />
      <ButtonV2 variant="icon-square" icon={<MusicNoteIcon />} disabled />
      <ButtonV2
        label="No disponible"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        disabled
      />

      <div className="container-sm">100% wide until small breakpoint</div>
      <div className="container-md">100% wide until medium breakpoint</div>
      <div className="container-lg">100% wide until large breakpoint</div>
      <div className="container-xl">100% wide until extra large breakpoint</div>
      <div className="container-xxl">
        100% wide until extra extra large breakpoint
      </div>

      <div className="container-fluid">
        <div className="row">
          {/* Columna izquierda — SearchBar */}
          <div className="col-6" style={{ backgroundColor: "red" }}>
            <SearchBar
              onSearch={(e) => {}}
              placeholder="gumi..."
              width="100%"
            />
          </div>

          {/* Columna derecha — vacía por ahora */}
          <div className="col-6" style={{ backgroundColor: "blue" }}></div>
        </div>
      </div>
      <div style={{ height: "100px", backgroundColor: "#ffdfc8" }}>
        <NavBarV3
          items={[
            { label: "Coreografías", to: "/catalogo" },
            { label: "Profesores", to: "/profesores" },
          ]}
          fontSize=" --font-size-md"
          collapsible={true}
        ></NavBarV3>
      </div>
      {/**<HeaderV2
        showMenu={true}
        showFullLogo={true}
        navItems={[
          { label: "Coreografías", to: "/catalogo" },
          { label: "Profesores", to: "/profesores" },
          { label: "Coreografíass", to: "/" },
        ]}
        showSearch={true}
        rightActions={
          <>
            <ButtonV2
              label="Inicia sesión"
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate("/login")}
            />
            <ButtonV2
              label="Regístrate"
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate("/registro")}
            />
          </>
        }
      ></HeaderV2>*/}
      <HeroSection></HeroSection>
      <DescriptionSection></DescriptionSection>
      <FeatureSection></FeatureSection>
      <PreviewSection></PreviewSection>
      <GenresSection></GenresSection>
      <TeacherSection></TeacherSection>
      <Footer></Footer>
    </div>
  );
};

export default LandingV2;
