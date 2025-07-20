"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("LanguageSelector");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: t("english"), country: "GB" },
    { code: "ru", name: t("russian"), country: "RU" },
    { code: "uz", name: t("uzbek"), country: "UZ" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation: close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative flex justify-center sm:justify-start">
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Select language"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "6.4px 10px",
          borderRadius: 7,
          border: "none",
          background: "#fff",
          cursor: "pointer",
          boxSizing: "border-box",
          gap: 7,
          fontWeight: 500,
          fontSize: 14,
          color: "#191919",
          fontFamily: "Manrope, sans-serif",
          letterSpacing: 0,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
        }}
        className="rounded-[7px] focus:outline-none transition-colors duration-150 justify-start "
        tabIndex={0}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#fff",
            border: "2px solid #EAEAEA",
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
            padding: 0,
          }}
          className="w-[18px] h-[18px]"
        >
          <ReactCountryFlag
            countryCode={currentLanguage?.country || "GB"}
            svg
            style={{
              width: 18,
              height: 18,
              objectFit: "cover",
              display: "block",
            }}
            className=""
          />
        </span>
        <span
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: "#191919",
            fontFamily: "Manrope, sans-serif",
            letterSpacing: 0,
            marginLeft: 7,
            whiteSpace: "nowrap",
          }}
          className="ml-[7px] text-[18px] font-medium font-manrope"
        >
          {currentLanguage?.name}
        </span>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 44,
              right: 0,
              minWidth: 180,
              background: "#fff",
              borderRadius: 7,
              zIndex: 50,
              padding: "12px 0",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
              gap: 0,
              overflow: "hidden",
            }}
            className="min-w-[180px] rounded-[7px] left-0 sm:left-auto sm:right-0"
            role="menu"
            aria-label="Language options"
          >
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={pathname}
                locale={lang.code}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 7,
                  fontWeight: 500,
                  fontSize: 18,
                  color: "#191919",
                  fontFamily: "Manrope, sans-serif",
                  letterSpacing: 0,
                  background: locale === lang.code ? "#f5f5f5" : "transparent",
                  cursor: "pointer",
                  margin: 0,
                  border: "none",
                  outline: "none",
                  transition: "background 0.15s",
                  gap: 7,
                }}
                aria-label={lang.name}
                onMouseDown={(e) => e.preventDefault()}
                role="menuitem"
                tabIndex={0}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    locale === lang.code ? "#f5f5f5" : "transparent")
                }
                className="h-[40px] text-[18px] font-medium font-manrope rounded-[7px]"
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 23,
                    height: 23,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#fff",
                    border: "2px solid #EAEAEA",
                    boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
                    padding: 0,
                  }}
                  className="w-[23px] h-[23px]"
                >
                  <ReactCountryFlag
                    countryCode={lang.country}
                    svg
                    style={{
                      width: 28,
                      height: 23,
                      objectFit: "cover",
                      display: "block",
                    }}
                    className=""
                  />
                </span>
                <span className="ml-[7px] text-[18px] font-medium font-manrope">
                  {lang.name}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
