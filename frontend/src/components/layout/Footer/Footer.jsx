import "./Footer.css";
import instagram from "../../../assets/icons/instagram.png";
import twitter from "../../../assets/icons/twitter.png";
import youtube from "../../../assets/icons/youtube.png";
import facebook from "../../../assets/icons/facebook.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-information">
        <p className="footer-text">© 2026 DanceLearn</p>
        <p className="footer-text">Terms</p>
        <p className="footer-text">Privacy</p>
      </div>
      <div className="footer-social">
        <img src={instagram} alt="Instagram" className="footer-icon" />
        <img src={twitter} alt="Twitter" className="footer-icon" />
        <img src={youtube} alt="YouTube" className="footer-icon" />
        <img src={facebook} alt="Facebook" className="footer-icon" />
      </div>
    </footer>
  );
};

export default Footer;
