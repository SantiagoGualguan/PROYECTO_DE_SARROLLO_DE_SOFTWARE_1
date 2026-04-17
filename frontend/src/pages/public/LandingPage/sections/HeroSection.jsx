import Button from "../../../../components/ui/Button/Button";
import mujer_bailando from "../../../../assets/mujer_bailando.png";
/**
 * Welcome section
 */
const hero = "w-full flex justify-center items-center px-28";
const content =
  "flex flex-row items-center gap-12 px-16 py-10 bg-[#FFDFC8] rounded-[50px] w-full";
const contentLeft = "flex flex-col items-start gap-12 flex-1 shrink-0 p-2";
const contentLeft_Button = "w-full flex justify-center";
const contentRight =
  "w-[520px] h-[520px] flex shrink-0 overflow-hidden relative";

const HeroSection = () => {
  return (
    <section className={hero}>
      <div className={content}>
        <div className={contentLeft}>
          <h1 className="text-[40px] font-bold text-black leading-tight">
            ¡Bienvenido a DanceLearn!
          </h1>
          <p className="text-[24px] font-medium text-black">
            Tu academia de baile online donde aprenderás a bailar tus canciones
            favoritas, paso a paso y a tu propio ritmo.
          </p>
          <div className={contentLeft_Button}>
            <Button
              label="Empieza a bailar ahora"
              variant="filled"
              size="large"
              color="var(--color-orange)"
              onClick={() => {}}
            />
          </div>
        </div>
        <div className={contentRight}>
          <img
            src={mujer_bailando}
            alt="Mujer bailando"
            className="w-full h-full object-none object-[-200px_-338px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
