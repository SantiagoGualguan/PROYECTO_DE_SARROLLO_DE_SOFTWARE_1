import "./DescriptionSection.css";

const DescriptionSection = () => {
  return (
    <section className="description-section">
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="description-content">
              <h2 className="description-title">
                Encuentra la coreografía perfecta para ti
              </h2>
              <p className="description-text">
                Contamos con una amplia variedad de tutoriales para todos los
                gustos y niveles. Sin importar si apenas estás comenzando o ya
                tienes experiencia, aquí hay algo para ti
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionSection;
