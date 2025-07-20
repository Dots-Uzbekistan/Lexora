"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import DemoModal from "./DemoModal";

export default function Cta() {
  const t = useTranslations("Cta");
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <>
      <section className="pb-[120px] bg-[#F5F5F5]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="text-center max-w-full"
          >
            <h2
              style={{ fontFamily: "Playfair Display, serif", fontWeight: 600 }}
              className="text-[32px] sm:text-[51px] text-[#191919] tracking-[0] text-center mb-2"
            >
              {t("ctaTitle")}
            </h2>
            <h3
              style={{ fontFamily: "Playfair Display, serif", fontWeight: 400 }}
              className="text-[18px] sm:text-[30px] text-[#5D5D5D] tracking-[0] text-center mb-2 sm:mb-10"
            >
              {t("subtitle")}
            </h3>
            <Button
              onClick={() => setDemoModalOpen(true)}
              className="bg-[#191919] text-[#EAEAEA] rounded-[8px] px-6 sm:px-8 flex items-center justify-center mx-auto mt-6 sm:mt-8 text-[16px] sm:text-[22px] py-7"
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 400,
                fontSize: 22.07,
                letterSpacing: 0,
                border: "none",
                boxShadow: "none",
              }}
            >
              {t("bookDemo")}
            </Button>
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
