"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import image1 from "../../assets/images/image1.png";
import image2 from "../../assets/images/image2.png";
import image3 from "../../assets/images/image3.png";
import image4 from "../../assets/images/image4.png";

export default function Features() {
  const t = useTranslations("Features");
  const [active, setActive] = useState(0);

  const features = [
    {
      id: 1,
      number: "01",
      name: t("feature1.title"),
      image: image1,
      heading: t("heading1"),
      desc1: t("desc1"),
      desc2: t("desc1_2"),
    },
    {
      id: 2,
      number: "02",
      name: t("feature2.title"),
      image: image2,
      heading: t("heading2"),
      desc1: t("desc2"),
      desc2: t("desc2_1"),
      desc3: t("desc2_2"),
    },
    {
      id: 3,
      number: "03",
      name: t("feature3.title"),
      image: image3,
      heading: t("heading3"),
      desc1: t("desc3"),
      desc2: t("desc3_1"),
    },
    {
      id: 4,
      number: "04",
      name: t("feature4.title"),
      image: image4,
      heading: t("heading4"),
      desc1: t("desc4"),
      desc2: t("desc4_1"),
    },
  ];

  // Intersection Observer hooks for each section (must be at top level, not in a loop)
  const inViewRefs: ((node?: Element | null) => void)[] = [];
  const inViews: boolean[] = [];
  for (let i = 0; i < features.length; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [ref, inView] = useInView({ threshold: 0.4 });
    inViewRefs.push(ref);
    inViews.push(inView);
  }

  // Update active tab based on which section is in view
  useEffect(() => {
    const firstInView = inViews.findIndex((inView) => inView);
    if (firstInView !== -1 && firstInView !== active) {
      setActive(firstInView);
    }
    // eslint-disable-next-line
  }, [inViews.join(",")]);

  // Scroll to section on sidebar click
  const handleSidebarClick = (idx: number) => {
    setActive(idx);
    const section = document.getElementById(`feature-section-${idx}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="pt-11 bg-[#F5F5F5]">
      <div className="container px-4 sm:px-14 gap-4 mx-auto flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar (hidden on mobile, horizontal on mobile above content) */}
        <aside
          className="hidden lg:flex w-[300px] sticky top-16 self-start flex-col pt-4 pr-4"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <nav className="flex flex-col gap-2 ">
            <div className="flex flex-col space-y-2">
              {features.map((feature, idx) => (
                <div
                  key={feature.id}
                  className="flex flex-row items-center"
                  style={{ height: 38 }}
                >
                  {/* Indicator cell */}
                  <div
                    style={{
                      position: "relative",
                      width: 5,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active === idx && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        style={{
                          width: 4,
                          height: 32,
                          borderRadius: 4,
                          background: "#a3a3a3",
                          position: "absolute",
                          left: 0,
                          top: 4,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                  {/* Content cell */}
                  <button
                    onClick={() => handleSidebarClick(idx)}
                    className={`group flex items-center w-full py-0 px-5 transition-all duration-300 text-left focus:outline-none bg-transparent`}
                    tabIndex={0}
                    style={{
                      fontWeight: active === idx ? 600 : 400,
                      fontSize: 13,
                      letterSpacing: 0,
                      height: 40,
                      paddingLeft: 6,
                      fontFamily: "Manrope, sans-serif",
                    }}
                  >
                    <span
                      className={`w-6 text-left ${
                        active === idx ? "text-[#191919]" : "text-[#5D5D5D]"
                      }`}
                    >
                      {feature.number}
                    </span>
                    <span
                      className={`flex-1 ${
                        active === idx ? "text-black" : "text-gray-500"
                      }`}
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        fontWeight: active === idx ? 600 : 400,
                      }}
                    >
                      {feature.name}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </nav>
        </aside>
        {/* Mobile Sidebar (horizontal, above main content) */}
        <nav className="flex lg:hidden flex-row px-0 sm:px-2 pb-4 overflow-x-auto min-w-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent justify-center">
          {features.map((feature, idx) => (
            <button
              key={feature.id}
              onClick={() => handleSidebarClick(idx)}
              className={` flex flex-col items-center justify-center px-3 py-2 rounded-[10px] min-w-[150px] transition-all duration-200 focus:outline-none border-none shadow-none text-xs sm:text-sm font-medium relative z-10
                ${
                  active === idx
                    ? "bg-white shadow-md font-bold text-black"
                    : "bg-gray-100 text-gray-500"
                }
              `}
              style={{ touchAction: "manipulation", border: "none" }}
            >
              <span className="text-base font-semibold mb-1 text-center">
                {feature.number}
              </span>
              <span className="text-xs sm:text-sm leading-tight text-center">
                {feature.name}
              </span>
            </button>
          ))}
        </nav>
        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-start items-stretch py-2 sm:py-4 space-y-8 sm:space-y-16 lg:space-y-[232px] w-full">
          {features.map((feature, idx) => (
            <section
              key={feature.id}
              id={`feature-section-${idx}`}
              ref={inViewRefs[idx]}
              className="flex flex-col lg:flex-row gap-6 lg:gap-x-8 items-center w-full min-h-[220px] sm:min-h-[400px] scroll-mt-16 sm:scroll-mt-28"
            >
              {/* Feature Image - always left, bigger */}
              <motion.div
                className="max-w-[350px] md:max-w-[580px] flex-shrink-0 overflow-hidden mx-auto lg:mx-0 h-[220px] sm:h-[320px] md:h-[400px] lg:h-[520px] order-1 lg:order-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={feature.image}
                  alt={feature.heading}
                  width={624}
                  height={520}
                  sizes="(max-width: 1024px) 100vw, 580px"
                  className="object-contain w-full h-auto max-w-full"
                  priority
                />
              </motion.div>
              {/* Text Content - always right */}
              <div className="h-full flex flex-col justify-between pb-14">
                <h2
                  className="text-xl sm:text-3xl md:text-4xl lg:text-[65px] leading-[1] font-normal text-[#191919] mb-4 sm:mb-8"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {feature.heading}
                </h2>
                <div
                  className="space-y-3 text-sm sm:text-base md:text-[17px] text-[#191919] font-normal max-w-full sm:max-w-2xl"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <p>{feature.desc1}</p>
                  <p>{feature.desc2}</p>
                  {feature.desc3 && <p>{feature.desc3}</p>}
                </div>
              </div>
            </section>
          ))}
        </main>
      </div>
    </section>
  );
}
