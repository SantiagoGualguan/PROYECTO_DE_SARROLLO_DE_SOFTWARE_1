import { useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CoreografiaCard from "./CoreografiaCard";
import "./CoreografiaCarrusel.css";

const CoreografiaCarrusel = ({ titulo, coreografias, onVerTodos }) => {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    trackRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <Box className="coreografia-carrusel" sx={{ mb: 5 }}>
      <Box
        className="coreografia-carrusel__header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          className="coreografia-carrusel__title"
        >
          {titulo}
        </Typography>

        <Button
          variant="text"
          size="small"
          onClick={onVerTodos}
          className="coreografia-carrusel__ver-todos"
        >
          Ver todos
        </Button>
      </Box>

      <Box
        className="coreografia-carrusel__body"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <IconButton
          size="small"
          onClick={() => scroll(-1)}
          className="coreografia-carrusel__nav"
          aria-label="Ver coreografías anteriores"
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box
          ref={trackRef}
          className="coreografia-carrusel__track"
          sx={{ flex: 1 }}
        >
          <div className="row g-3 flex-nowrap">
            {coreografias.map((coreografia) => (
              <div
                key={coreografia.coreography_id}
                className="col-auto coreografia-carrusel__item"
              >
                <CoreografiaCard coreografia={coreografia} />
              </div>
            ))}
          </div>
        </Box>

        <IconButton
          size="small"
          onClick={() => scroll(1)}
          className="coreografia-carrusel__nav"
          aria-label="Ver más coreografías"
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CoreografiaCarrusel;
