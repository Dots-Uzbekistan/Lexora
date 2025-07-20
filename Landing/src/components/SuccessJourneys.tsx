"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function SuccessJourneys() {
  const t = useTranslations("SuccessJourneys");

  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1730px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif font-bold text-center mb-16">
          {t("title")}
        </h2>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Large Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-8 h-64 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-4xl font-serif font-bold text-foreground/20 mb-4"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  {t("testimonialLabel")}
                </div>
                <div
                  className="text-lg text-foreground/60"
                  style={{ fontFamily: "Segoe UI, sans-serif" }}
                >
                  {t("videoPlaceholder")}
                </div>
              </div>
            </div>
            <p className="text-2xl font-serif leading-relaxed mb-6">
              &quot;{t("testimonial1")}&quot;
            </p>
          </motion.div>

          {/* Author Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="pt-8"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-48 flex items-center justify-center mb-6">
              <div className="text-center">
                <div
                  className="text-2xl font-serif font-bold text-foreground/20 mb-2"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  {t("photoLabel")}
                </div>
                <div
                  className="text-sm text-foreground/60"
                  style={{ fontFamily: "Segoe UI, sans-serif" }}
                >
                  {t("profileImage")}
                </div>
              </div>
            </div>
            <p className="font-bold text-lg">{t("testimonial1Author")}</p>
            <p className="text-sm text-foreground/60">
              {t("testimonial1Role")}
            </p>
          </motion.div>

          {/* Second Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="pt-8"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-48 flex items-center justify-center mb-6">
              <div className="text-center">
                <div
                  className="text-2xl font-serif font-bold text-foreground/20 mb-2"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  {t("photoLabel")}
                </div>
                <div
                  className="text-sm text-foreground/60"
                  style={{ fontFamily: "Segoe UI, sans-serif" }}
                >
                  {t("profileImage")}
                </div>
              </div>
            </div>
            <p className="font-bold text-lg">{t("testimonial2Author")}</p>
            <p className="text-sm text-foreground/60">
              {t("testimonial2Role")}
            </p>
          </motion.div>

          {/* Second Large Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-8 h-64 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-4xl font-serif font-bold text-foreground/20 mb-4"
                  style={{ fontFamily: "Crimson Text, serif" }}
                >
                  {t("testimonialLabel")}
                </div>
                <div
                  className="text-lg text-foreground/60"
                  style={{ fontFamily: "Segoe UI, sans-serif" }}
                >
                  {t("videoPlaceholder")}
                </div>
              </div>
            </div>
            <p className="text-2xl font-serif leading-relaxed">
              &quot;{t("testimonial2")}&quot;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
