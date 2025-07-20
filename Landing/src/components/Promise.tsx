"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Promise() {
  const t = useTranslations("Promise");

  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1730px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2
            className="text-3xl font-serif font-bold mb-8 uppercase tracking-wide text-foreground"
            style={{ fontFamily: "Crimson Text, serif" }}
          >
            {t("title")}
          </h2>
          <p
            className="text-2xl font-serif leading-relaxed mb-12 text-foreground"
            style={{ fontFamily: "Crimson Text, serif" }}
          >
            {t("description")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
