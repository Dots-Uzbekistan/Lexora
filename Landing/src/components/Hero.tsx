"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import DemoModal from "./DemoModal";
import Image from "next/image";
import heroImage from "../../assets/hero_image.png";
import { ArrowRight } from "lucide-react";
export default function Hero() {
  const t = useTranslations("Hero");
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const parentVariant: Variants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const childVariant: Variants = {
    initial: { opacity: 0, y: 32, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 24 },
    },
  };

  return (
    <>
      <section className="pt-16 md:pt-22 flex flex-col lg:flex-row items-center bg-[#F5F5F5] pb-4 sm:pb-10 lg:pb-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8 h-full w-full px-4 sm:px-14 ">
          {/* Left Column - Content */}
          <motion.div
            variants={parentVariant}
            initial="initial"
            animate="animate"
            className="flex-1 flex flex-col w-full"
          >
            <motion.div variants={childVariant}>
              {/* Announcement Pill */}
              <div className="hidden md:flex md:mt-3 items-center gap-1 bg-[#5D5D5D]/10 w-full max-w-full sm:min-w-[490px] sm:max-w-[580px] rounded-[14px] sm:rounded-[14.59px] p-[7px_10px] sm:p-[11px_17px] font-medium text-[#191919] font-manrope mb-[18px] text-[10px] sm:text-[12.8px] whitespace-nowrap overflow-x-auto overflow-y-hidden text-ellipsis scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis min-w-0 text-[11px] sm:text-[13px]">
                  {t("announcementBold")}
                </span>
                <span className="flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                  {t("announcementRest")}{" "}
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </span>
              </div>
            </motion.div>
            <motion.h1
              variants={childVariant}
              className="text-[40px] leading-[1] md:text-[76px] font-normal text-[#191919] md:leading-[72px] text-left pt-10"
            >
              <span style={{ fontFamily: "Manrope, sans-serif" }}>
                {t("mainTitleStart")}
              </span>
              <br />
              <span style={{ fontFamily: "Playfair Display, serif" }}>
                <span className="underline decoration-2 decoration-[#191919]/80 underline-offset-2">
                  {t("mainTitleThink")}
                </span>
                ,{" "}
                <span className="underline decoration-2 decoration-[#191919]/80 underline-offset-2">
                  {t("mainTitlePlan")}
                </span>
                , {t("and")}{" "}
                <span className="underline decoration-2 decoration-[#191919]/80 underline-offset-2">
                  {t("mainTitleSolve")}
                </span>
              </span>
              {t("mainTitleEnd") && (
                <span style={{ fontFamily: "Manrope, sans-serif" }}>
                  {" "}
                  {t("mainTitleEnd")}
                </span>
              )}
            </motion.h1>
            <motion.p
              variants={childVariant}
              className="font-manrope font-medium text-[14.4px] text-[#191919] tracking-[0] text-left mt-[32px] sm:mt-[54px] mb-[28px] sm:mb-[36px] max-w-full sm:max-w-md leading-[24px]"
            >
              {t("mainDescription")}
            </motion.p>
            <motion.div variants={childVariant}>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="bg-black text-white hover:bg-black/80 cursor-pointer px-[32px] py-[10px] text-base font-medium  rounded-[8px] text-[14.4px]"
              >
                {t("requestDemo")}
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - AI Chat Interface (Full Height) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: 32 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              type: "spring" as const,
              stiffness: 220,
              damping: 22,
            }}
            className="flex-1 flex items-center justify-center max-w-[620px] "
          >
            <Image
              src={heroImage}
              alt="Hero Image"
              width={775}
              height={709}
              className="object-contain w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </>
  );
}
