import "./PreviewSection.css";
import womanDanceHome from "../../../../assets/images/womanDanceHome.png";
import twoWomanDance from "../../../../assets/images/twoWomanDance.png";

const PreviewSection = () => {
  return (
    <section className="preview-section">
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center ">
          {/* ── Fotos — 4 cols en md+, 10 cols en móvil, segundo en móvil ── */}
          <div className="col-10 col-md-5 order-2 order-md-1 preview-photos-col">
            <div className="preview-photos">
              <img
                src={twoWomanDance}
                alt="Dos mujeres bailando en una casa"
                className="preview-img preview-img--top"
              />
              <img
                src={womanDanceHome}
                alt="Mujer bailando en la sala de una casa"
                className="preview-img preview-img--bottom"
              />
            </div>
          </div>

          {/* ── Información — 4 cols en md+, 10 cols en móvil, primero en móvil ── */}
          <div className="col-10 col-md-5 order-1 order-md-2 preview-info-col">
            <div className="preview-information">
              <h2 className="preview-title">Compra con confianza</h2>
              <p className="preview-text">
                Antes de adquirir cualquier coreografía, podrás ver un avance
                gratuito para asegurarte de que es exactamente lo que buscas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;
