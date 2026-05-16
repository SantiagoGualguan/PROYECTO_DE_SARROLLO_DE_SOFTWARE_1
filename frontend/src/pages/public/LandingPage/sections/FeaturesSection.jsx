import principiante from "../../../../assets/principiante.png";
import intermedio from "../../../../assets/intermedio.png";
import avanzado from "../../../../assets/avanzado.png";
import individual from "../../../../assets/individual.png";
import pareja from "../../../../assets/pareja.png";
import grupo from "../../../../assets/grupo.png";

/**
 * section on the characteristics of the choreographies
 */

const featureSection =
  "w-full grid grid-cols-2 gap-[100px] px-[113px] py-[10px]";
const card =
  "flex flex-col items-center gap-10 px-[10px] py-[30px] rounded-[30px]";
const iconsDificult =
  "flex flex-row items-center justify-center gap-5 p-[10px]";
const iconItem = "flex flex-col items-center gap-[10px]";
const iconsModal =
  "flex flex-row items-center justify-center gap-[30px] p-[10px]";

const FeatureSection = () => {
  return (
    <section className={featureSection}>
      {/*   nivel de dificultad */}
      <div
        className={card}
        style={{ background: "linear-gradient(180deg, #FF9A7D, #FF5524)" }}
      >
        <h2 className="text-[32px] font-bold text-white text-center">
          Nivel de dificultad
        </h2>
        <div className={iconsDificult}>
          <div className={iconItem}>
            <img
              src={principiante}
              alt="principiante"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">principiante</p>
          </div>
          <div className={iconItem}>
            <img
              src={intermedio}
              alt="intermedio"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">intermedio</p>
          </div>
          <div className={iconItem}>
            <img
              src={avanzado}
              alt="avanzado"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">avanzado</p>
          </div>
        </div>
      </div>
      {/**     Modalidad        */}
      <div
        className={card}
        style={{ background: "linear-gradient(180deg, #FF9A7D, #FF5524)" }}
      >
        <p className="text-[32px] font-bold text-white text-center">
          Modalidad
        </p>
        <div className={iconsModal}>
          <div className={iconItem}>
            <img
              src={individual}
              alt="individual"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">individual</p>
          </div>
          <div className={iconItem}>
            <img
              src={pareja}
              alt="pareja"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">Pareja</p>
          </div>
          <div className={iconItem}>
            <img
              src={grupo}
              alt="grupo"
              className="w-[100px] h-[100px] object-contain"
            />
            <p className="text-[24px] font-bold text-white">Grupo</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
