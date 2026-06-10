import regueton from "../../../../assets/images/reguetonDance.jpg";
import salsa from "../../../../assets/images/salsaDance.jpg";
import hiphop from "../../../../assets/images/hiphopDance.png";
import bachata from "../../../../assets/images/bachataDance.jpg";
import pop from "../../../../assets/images/popDance.png";
import cumbia from "../../../../assets/images/cumbiaDance.png";
import merengue from "../../../../assets/images/merengueDance.jpg";
import tango from "../../../../assets/images/tangoDance.png";

import Button from "../../../../components/ui/Button/Button";

/**
 * frameGenre: autolayout vertical, width fill, gap 10px,
 *   alineación center, padding horizontal 113px vertical 30px, fondo --color-primary.
 *   - título: 36px bold blanco.
 *   - texto: 34px medium blanco.
 * frameMusicalGenres: autolayout vertical, width fill, alineación center, padding 10px.
 *   genreList x2: autolayout horizontal, gap auto, padding horizontal 10px vertical 10px.
 *     genre: autolayout vertical, gap 15px, alineación center, padding 10px.
 *       - imagen: 223x169px, border-radius 20px.
 *       - texto: 24px medium blanco.
 * Botón: "Ver todos los géneros", alto 56px.
 */

const frameGenre =
  "w-full flex flex-col items-center gap-[10px] px-[113px] py-[30px] bg-[var(--color-primary)]";
const frameMusicalGenres =
  "w-full flex flex-col items-center gap-[10px] px-[10px] py-[10px]";
const genreList = "w-full flex flex-row justify-between px-[10px] py-[10px]";
const genre = "flex flex-col items-center gap-[15px] px-[10px] py-[10px]";
const GenresSection = () => {
  return (
    <section className={frameGenre}>
      <h2 className="text-[36px] font-bold text-white text-center">
        ¡Atrévete a bailar lo que siempre quisiste!
      </h2>
      <p className="text-[34px] font-medium text-white text-center">
        En DanceLearn encontrarás coreografías de los géneros que más te gustan
        y también de los que aún no te has animado a intentar.
      </p>
      <div className={frameMusicalGenres}>
        <div className={genreList}>
          <div className={genre}>
            <img
              src={regueton}
              alt="personas bailando regueton"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Regueton</p>
          </div>
          <div className={genre}>
            <img
              src={salsa}
              alt="personas bailando salsa"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Salsa</p>
          </div>
          <div className={genre}>
            <img
              src={hiphop}
              alt="personas bailando hiphop"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Hip-Hop</p>
          </div>
          <div className={genre}>
            <img
              src={bachata}
              alt="personas bailando bachata"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Bachata</p>
          </div>
        </div>
        <div className={genreList}>
          <div className={genre}>
            <img
              src={pop}
              alt="persona bailando pop"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Pop</p>
          </div>
          <div className={genre}>
            <img
              src={cumbia}
              alt="personas bailando cumbia"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Cumbia</p>
          </div>
          <div className={genre}>
            <img
              src={merengue}
              alt="personas bailando merengue"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Merengue</p>
          </div>
          <div className={genre}>
            <img
              src={tango}
              alt="personas bailando tango"
              className="w-[223px] h-[169px] object-cover rounded-[20px]"
            />
            <p className="text-[24px] font-medium text-white">Tango</p>
          </div>
        </div>
      </div>
      <Button
        label="Ver todos los géneros"
        variant="filled"
        size="large"
        color="var(--color-peach)"
        onClick={() => {}}
        className="text-black"
      />
    </section>
  );
};

export default GenresSection;
