import teacher from "../../../../assets/images/teacherDance.png";
import Button from "../../../../components/ui/Button/Button";
/**
 * frame principal: autolayout flow: horizontal gap:69, padding: ancho:113, alto:30 alingment:center
 * con:
 * frame profesor: autolayout flow:vertical gap:10, padding: ancho:40, alto:30, alingment center
 *               con: figura elipse: widht:350, height:350, stroke outside weight:27 color FF9B7D
 * frame invitacion: autolayout flow:vertical gap:35 alignment:center padding: ancho:10, alto:10
 *              con:
 *             texto 1: "¿Eres bailarín profesional? Únete como profesor" 36 bold
 *             texto 2: "DanceLearn es el lugar ideal para compartir tu talento y generar ingresos con lo que más te apasiona. Publica tus coreografías, llega a estudiantes de todo el mundo y sácale provecho a tu creatividad." 24 medium
 *             Button: filed "Quiero ser profesor"
 * @returns
 */

const teacherInvitation =
  "w-full flex flex-row items-center gap-[69px] px-[113px] py-[30px]";
const teacherPhoto =
  "flex flex-col items-center justify-center gap-[10px] px-[40px] py-[30px] shrink-0";
const invitation =
  "flex flex-col items-center gap-[35px] px-[10px] py-[10px] flex-1";
const TeacherSection = () => {
  return (
    <section className={teacherInvitation}>
      <div className={teacherPhoto}>
        <div
          className="rounded-full overflow-hidden shrink-0"
          style={{
            width: "350px",
            height: "350px",
            outline: "27px solid #FF9B7D",
          }}
        >
          <img
            src={teacher}
            alt="Profesor de baile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className={invitation}>
        <h2 className="text-[36px] font-bold text-black text-center">
          ¿Eres bailarín profesional? Únete como profesor
        </h2>
        <p className="text-[24px] font-medium text-black text-center">
          DanceLearn es el lugar ideal para compartir tu talento y generar
          ingresos con lo que más te apasiona. Publica tus coreografías, llega a
          estudiantes de todo el mundo y sácale provecho a tu creatividad.
        </p>
        <Button
          label="Quiero ser profesor"
          variant="filled"
          size="large"
          color="var(--color-primary)"
          onClick={() => {}}
        />
      </div>
    </section>
  );
};

export default TeacherSection;
