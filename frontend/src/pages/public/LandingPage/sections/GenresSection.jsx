import regueton from "../../../../assets/images/reguetonDance.jpg";
import salsa from "../../../../assets/images/salsaDance.jpg";
import hiphop from "../../../../assets/images/hiphopDance.png";
import bachata from "../../../../assets/images/bachataDance.jpg";
import pop from "../../../../assets/images/popDance.png";
import cumbia from "../../../../assets/images/cumbiaDance.png";
import merengue from "../../../../assets/images/merengueDance.jpg";
import tango from "../../../../assets/images/tangoDance.png";

/**
 * Frame principal: Autolayout width: fill, gap:10, alingment: center
 *                  padding ancho:113, alto:30. flow:vertical
 * texto 1: " ¡Atrévete a bailar lo que siempre quisiste! " Bold 36 roboto
 * texto 2: "En DanceLearn encontrarás coreografías de los géneros que más te gustan y también de los que aún no te has animado a intentar."
 *          34 medium
 * frame generos musicales : autolayout flow: vertical weidth: fill, alignment. center, padding: ancho:10, alto:10
 *      con:
 *     frame lista de generos 1: autolayout flow: horizontal, gap: auto, padding: ancho:10 alto:10
 *                               alignment: aling top
 *      regueton, salsa, hiphop, bachata
 *      frame lista de generos 2: autolayout flow: horizontal, gap: auto, padding: ancho:10 alto:10
 *                               alignment: aling top
 *      pop, cumbia, merengue, tango
 *      cada fram lista de generos, tiene cuatro componentes, con estas caracteristicas:
 *      frame genero: autolayout flow:vertical, gap:15, alignment:center padding ancho:10, alto:10
 *      con:
 *      imagen: weidth: 223, height:169 corner radius 20
 *      texto: "nombre del genero"  24 medium roboto
 *por ultimo: Button "ver todo los generos" h:56
 * @returns
 */

const GenresSection = () => {
  return <></>;
};

export default GenresSection;
