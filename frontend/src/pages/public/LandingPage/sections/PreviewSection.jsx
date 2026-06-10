import womanDanceHome from "../../../../assets/images/womanDanceHome.png";
import twoWomanDance from "../../../../assets/images/twoWomanDance.png";

/**
 * preview: autolayout horizontal, gap 50px, padding horizontal 113px vertical 10px, alineación center.
 * framePhotos: autolayout vertical, alineación center, gap 10px, ancho 538px.
 *   photos: layout con superposición, alto 221px.
 *     - foto 1 womanDanceHome: 281x131px, border-radius 20px, posición x:0 y:0.
 *     - foto 2 twoWomanDance: 281x131px, border-radius 20px, posición x:238 y:71.
 * information: autolayout vertical, ancho 586px, gap 20px, alineación center, padding 30px.
 *   - título: 32px bold.
 *   - texto: 24px medium.
 */

const preview =
  "w-full flex flex-row items-center justify-center gap-[50px] px-[113px] py-[10px] min-h-[300px]";
const framePhotos =
  "flex flex-col items-center justify-center gap-[10px] w-[538px] shrink-0";
const photos = "relative w-full h-[221px]";
const information =
  "flex flex-col items-center justify-center gap-5 flex-1  px-[30px] py-[30px] ";
const PreviewSection = () => {
  return (
    <section className={preview}>
      <div className={framePhotos}>
        <div className={photos}>
          <img
            src={twoWomanDance}
            alt="Dos mujeres bailando en una casa"
            className="absolute rounded-[20px] object-cover"
            style={{ width: "281px", height: "131px", left: "0px", top: "0px" }}
          />
          <img
            src={womanDanceHome}
            alt="Mujer bailando en la sala de una casa"
            className="absolute rounded-[20px] object-cover"
            style={{
              width: "281px",
              height: "131px",
              left: "238px",
              top: "71px",
            }}
          />
        </div>
      </div>
      <div className={information}>
        <h2 className="text-[32px] font-bold text-black text-center">
          Compra con confianza
        </h2>
        <p className="text-[24px] font-medium text-black text-center">
          Antes de adquirir cualquier coreografía, podrás ver un avance gratuito
          para asegurarte de que es exactamente lo que buscas.
        </p>
      </div>
    </section>
  );
};

export default PreviewSection;
