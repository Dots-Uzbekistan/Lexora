"use client";

import { useTranslations } from "next-intl";

export default function TrustedBy() {
  const t = useTranslations("TrustedBy");

  const logos = [
    t("partner1"),
    t("partner2"),
    t("partner3"),
    t("partner4"),
    t("partner5"),
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background w-full overflow-hidden">
      <div className="w-full px-0">
        <h2
          className="text-lg sm:text-xl font-serif mb-8 sm:mb-10 text-foreground/60 text-center"
          style={{ fontFamily: "Crimson Text, serif" }}
        >
          {t("title")}
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-marquee">
            {/* First set of logos */}
            {logos.map((logo, idx) => (
              <div
                key={`first-${logo}-${idx}`}
                className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground/70 px-8 py-3 flex items-center justify-center flex-shrink-0"
                style={{ minWidth: "200px" }}
              >
                {logo}
              </div>
            ))}
            {/* Second set of logos (duplicate for seamless loop) */}
            {logos.map((logo, idx) => (
              <div
                key={`second-${logo}-${idx}`}
                className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground/70 px-8 py-3 flex items-center justify-center flex-shrink-0"
                style={{ minWidth: "200px" }}
              >
                {logo}
              </div>
            ))}
            {/* Third set of logos (additional duplicate for smoother loop) */}
            {logos.map((logo, idx) => (
              <div
                key={`third-${logo}-${idx}`}
                className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground/70 px-8 py-3 flex items-center justify-center flex-shrink-0"
                style={{ minWidth: "200px" }}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
