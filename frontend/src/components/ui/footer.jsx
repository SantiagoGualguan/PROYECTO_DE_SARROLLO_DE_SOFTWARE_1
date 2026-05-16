import instagram from "../../assets/icons/instagram.png";
import twitter from "../../assets/icons/twitter.png";
import youtube from "../../assets/icons/youtube.png";
import facebook from "../../assets/icons/facebook.png";

/**
 * Footer de la aplicación.
 * footerFrame: autolayout vertical, gap 10px, padding horizontal 10px vertical 30px,
 *   alineación top center, fondo --color-pink-light (#FFABCB).
 * information: autolayout horizontal, alineación center, gap 20px.
 *   - 3 textos: Roboto light 16px.
 * socialNetworks: autolayout horizontal, alineación center, gap 20px.
 *   - 4 íconos: 20x20px.
 */

const footerFrame =
  "w-full flex flex-col items-center gap-[10px] px-[10px] py-[30px] bg-[#FFABCB]";
const information = "flex flex-row items-center justify-center gap-[20px]";
const socialNetworks = "flex flex-row items-center justify-center gap-[20px]";
const Footer = () => {
  return (
    <footer className={footerFrame}>
      <div className={information}>
        <p className="text-[16px] font-light text-black">© 2026 DanceLearn</p>
        <p className="text-[16px] font-light text-black">tearms</p>
        <p className="text-[16px] font-light text-black">privacy</p>
      </div>
      <div className={socialNetworks}>
        <img
          src={instagram}
          alt="Instagram"
          className="w-[20px] h-[20px] object-contain"
        />
        <img
          src={twitter}
          alt="Twitter"
          className="w-[20px] h-[20px] object-contain"
        />
        <img
          src={youtube}
          alt="YouTube"
          className="w-[20px] h-[20px] object-contain"
        />
        <img
          src={facebook}
          alt="Facebook"
          className="w-[20px] h-[20px] object-contain"
        />
      </div>
    </footer>
  );
};
export default Footer;
