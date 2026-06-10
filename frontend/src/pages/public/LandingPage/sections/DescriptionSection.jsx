const descriptionSection = "w-full flex justify-center items-center px-28";
const content = "flex flex-col items-center gap-8 px-16 py-5 w-full";

/**
 * App description section
 * @returns
 */

const DescriptionSection = () => {
  return (
    <section className={descriptionSection}>
      <div className={content}>
        <h2 className="text-[36px] font-bold text-black text-center">
          Encuentra la coreografía perfecta para ti
        </h2>
        <p className="text-[24px] font-medium text-black text-center">
          Contamos con una amplia variedad de tutoriales para todos los gustos y
          niveles. Sin importar si apenas estás comenzando o ya tienes
          experiencia, aquí hay algo para ti
        </p>
      </div>
    </section>
  );
};

export default DescriptionSection;
