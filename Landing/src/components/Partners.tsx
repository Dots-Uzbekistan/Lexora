import { useTranslations } from "next-intl";
import { motion, easeOut } from "framer-motion";
import { Sarmo, StartupGarage } from "../../assets/icons/MainIcons";

export default function Partners() {
  const t = useTranslations("TrustedBy");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: easeOut,
      },
    },
  };

  return (
    <section className="w-full bg-[#F5F5F5]">
      <motion.div
        className="py-8 px-4 sm:py-[104px] container sm:px-14 mx-auto flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 md:gap-[111px]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Left: Description */}
        <motion.div
          className="text-[16px] leading-[20px] sm:text-[19px] sm:leading-[19px] text-gray-400 font-normal max-w-full sm:max-w-[250px] text-center md:text-left mb-4 sm:mb-0"
          variants={itemVariants}
        >
          {t("title")}
        </motion.div>
        {/* Center: Partner Logo */}
        <motion.div
          className="flex items-center justify-center gap-8 sm:gap-[111px]"
          variants={itemVariants}
        >
          <motion.div variants={logoVariants}>
            <StartupGarage className="w-[90px] sm:w-[140px]" />
          </motion.div>
          <motion.div variants={logoVariants}>
            <Sarmo className="w-[120px] h-[40px] sm:w-[200px] sm:h-[70px]" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
