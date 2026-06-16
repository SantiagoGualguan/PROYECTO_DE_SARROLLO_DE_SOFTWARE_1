import "./GenresSection.css";
import regueton from "../../../../assets/images/reguetonDance.jpg";
import salsa from "../../../../assets/images/salsaDance.jpg";
import hiphop from "../../../../assets/images/hiphopDance.png";
import bachata from "../../../../assets/images/bachataDance.jpg";
import pop from "../../../../assets/images/popDance.png";
import cumbia from "../../../../assets/images/cumbiaDance.png";
import merengue from "../../../../assets/images/merengueDance.jpg";
import tango from "../../../../assets/images/tangoDance.png";
import ButtonV2 from "../../../../components/ui/Button/ButtonV2";

const genres = [
  { src: regueton, alt: "personas bailando regueton", label: "Regueton" },
  { src: salsa, alt: "personas bailando salsa", label: "Salsa" },
  { src: hiphop, alt: "personas bailando hiphop", label: "Hip-Hop" },
  { src: bachata, alt: "personas bailando bachata", label: "Bachata" },
  { src: pop, alt: "persona bailando pop", label: "Pop" },
  { src: cumbia, alt: "personas bailando cumbia", label: "Cumbia" },
  { src: merengue, alt: "personas bailando merengue", label: "Merengue" },
  { src: tango, alt: "personas bailando tango", label: "Tango" },
];

const GenresSection = () => {
  return (
    <section className="genres-section">
      <div className="container-fluid">
        {/* ── Título y descripción ── */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <h2 className="genres-title">
              ¡Atrévete a bailar lo que siempre quisiste!
            </h2>
            <p className="genres-description">
              En DanceLearn encontrarás coreografías de los géneros que más te
              gustan y también de los que aún no te has animado a intentar.
            </p>
          </div>
        </div>

        {/* ── Grid de géneros ── */}
        <div className="row justify-content-center g-3">
          {genres.map(({ src, alt, label }) => (
            <div
              key={label}
              className="col-6 col-md-4 col-lg-3" // 2 en móvil, 3 en tablet, 4 en desktop
            >
              <div className="genre-item">
                <img src={src} alt={alt} className="genre-img" />
                <p className="genre-label">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Botón ── */}
        <div className="row justify-content-center">
          <div className="col-auto genres-button">
            <ButtonV2
              label="Ver todos los géneros"
              variant="contained"
              size="large"
              color="peach"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenresSection;
