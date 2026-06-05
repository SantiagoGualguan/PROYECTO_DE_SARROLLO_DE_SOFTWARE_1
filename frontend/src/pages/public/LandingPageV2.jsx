import ButtonV2 from "../../components/ui/Button/ButtonV2";
import StarIcon from "@mui/icons-material/Star";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const LandingV2 = () => {
  return (
    <div
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      {/*
      <h2>Contained</h2>
      <ButtonV2 label="Empezar" variant="contained" size="small" />
      <ButtonV2 label="Empezar" variant="contained" size="medium" />
      <ButtonV2
        label="Empezar"
        variant="contained"
        size="large"
        color="#ff6a3f"
      />

      <h2>Outlined</h2>
      <ButtonV2 label="Ver más" variant="outlined" size="small" />
      <ButtonV2 label="Ver más" variant="outlined" size="medium" />
      <ButtonV2 label="Ver más" variant="outlined" size="large" />

      <h2>Text</h2>
      <ButtonV2 label="Cancelar" variant="text" size="medium" />
      <ButtonV2
        label="Cancelar"
        variant="text"
        size="medium"
        color="--color-orange"
      />

      <h2>Icon circular</h2>
      <ButtonV2 variant="icon" icon={<StarIcon />} size="small" />
      <ButtonV2
        variant="icon"
        icon={<StarIcon />}
        color="--color-salmon"
        size="medium"
      />

      <h2>Icon square</h2>
      <ButtonV2 variant="icon-square" icon={<MusicNoteIcon />} size="small" />
      <ButtonV2
        variant="icon-square"
        icon={<MusicNoteIcon />}
        color="#ff9b7d"
        size="medium"
      />

      <h2>Icon + Text</h2>
      <ButtonV2
        label="Explorar"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        size="medium"
      />
      <ButtonV2
        label="Explorar"
        variant="icon-text"
        icon={<MusicNoteIcon />}
        size="large"
        color="--color-salmon"
      />

      <h2>Disabled</h2>
      <ButtonV2 label="No disponible" variant="contained" disabled />
      <ButtonV2 label="No disponible" variant="outlined" disabled />
      <ButtonV2 variant="icon" icon={<StarIcon />} disabled />

    */}
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
        label="Empezar"
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
    </div>
  );
};

export default LandingV2;
