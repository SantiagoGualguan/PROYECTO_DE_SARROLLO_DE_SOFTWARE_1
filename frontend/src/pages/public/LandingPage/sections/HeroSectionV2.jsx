import ButtonV2 from "../../../../components/ui/Button/ButtonV2";
import mujer_bailando from "../../../../assets/images/mujer_bailando.png";
import mujer_bailando2 from "../../../../assets/images/mujer_bailando2.png";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container-xl">
        <div className="row  justify-content-center">
          {/* Contenedor principal — 10 cols en xl/lg, 12 en md/sm */}
          <div className="col-12 col-lg-10">
            <div className="hero-content row align-items-center ">
              {/* Texto — 5 cols en xl/lg, 12 en md/sm */}
              <div className="col-12 col-lg-6 hero-left">
                <h1 className="hero-title">¡Bienvenido a DanceLearn!</h1>
                <p className="hero-description">
                  Tu academia de baile online donde aprenderás a bailar tus
                  canciones favoritas, paso a paso y a tu propio ritmo.
                </p>
                <div className="hero-button">
                  <ButtonV2
                    label="Empieza a bailar ahora"
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => {}}
                  />
                </div>
              </div>

              {/* Imagen — 5 cols en xl/lg,*/}
              <div className="col-12 col-lg-6 hero-right">
                <img
                  src={mujer_bailando2}
                  alt="Mujer bailando"
                  className="hero-image hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
