import "./FeatureSection.css";
import principiante from "../../../../assets/principiante.png";
import intermedio from "../../../../assets/intermedio.png";
import avanzado from "../../../../assets/avanzado.png";
import individual from "../../../../assets/individual.png";
import pareja from "../../../../assets/pareja.png";
import grupo from "../../../../assets/grupo.png";

const FeatureSection = () => {
  return (
    <section className="feature-section">
      <div className="container-fluid">
        <div className="row justify-content-center gap-5">
          {/* ── Card Nivel de dificultad ── */}
          <div
            className="col-10 col-md-5 feature-card"
            style={{ background: "linear-gradient(180deg, #FF9A7D, #FF5524)" }}
          >
            <h2 className="feature-card-title">Nivel de dificultad</h2>
            <div className="feature-icons">
              <div className="feature-icon-item">
                <img
                  src={principiante}
                  alt="principiante"
                  className="feature-icon-img"
                />
                <p className="feature-icon-label">principiante</p>
              </div>
              <div className="feature-icon-item">
                <img
                  src={intermedio}
                  alt="intermedio"
                  className="feature-icon-img"
                />
                <p className="feature-icon-label">intermedio</p>
              </div>
              <div className="feature-icon-item">
                <img
                  src={avanzado}
                  alt="avanzado"
                  className="feature-icon-img"
                />
                <p className="feature-icon-label">avanzado</p>
              </div>
            </div>
          </div>

          {/* ── Card Modalidad ── */}
          <div
            className="col-10 col-md-5 feature-card"
            style={{ background: "linear-gradient(180deg, #FF9A7D, #FF5524)" }}
          >
            <h2 className="feature-card-title">Modalidad</h2>
            <div className="feature-icons">
              <div className="feature-icon-item">
                <img
                  src={individual}
                  alt="individual"
                  className="feature-icon-img"
                />
                <p className="feature-icon-label">individual</p>
              </div>
              <div className="feature-icon-item">
                <img src={pareja} alt="pareja" className="feature-icon-img" />
                <p className="feature-icon-label">Pareja</p>
              </div>
              <div className="feature-icon-item">
                <img src={grupo} alt="grupo" className="feature-icon-img" />
                <p className="feature-icon-label">Grupo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
