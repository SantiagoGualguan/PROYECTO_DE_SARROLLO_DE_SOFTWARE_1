import "./TeacherSection.css";
import teacher from "../../../../assets/images/teacherDance.png";
import ButtonV2 from "../../../../components/ui/Button/Button";

const TeacherSection = () => {
  return (
    <section className="teacher-section">
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center">
          {/* ── Foto — orden 2 en móvil, orden 1 en desktop ── */}
          <div className="col-10 col-md-4 order-2 order-md-1 teacher-photo-col">
            <div className="teacher-photo-wrapper">
              <img
                src={teacher}
                alt="Profesor de baile"
                className="teacher-photo-img"
              />
            </div>
          </div>

          {/* ── Invitación — orden 1 en móvil, orden 2 en desktop ── */}
          <div className="col-10 col-md-5 order-1 order-md-2 teacher-invitation-col">
            <div className="teacher-invitation">
              <h2 className="teacher-title">
                ¿Eres bailarín profesional? Únete como profesor
              </h2>
              <p className="teacher-text">
                DanceLearn es el lugar ideal para compartir tu talento y generar
                ingresos con lo que más te apasiona. Publica tus coreografías,
                llega a estudiantes de todo el mundo y sácale provecho a tu
                creatividad.
              </p>
              <ButtonV2
                label="Quiero ser profesor"
                variant="contained"
                size="large"
                color="primary"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherSection;
