"use client";

import { Logo } from "../../assets/icons/MainIcons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-[#F5F5F5]">
      {/* Main Footer Content */}
      <div className="border-t border-gray-200 border-b">
        <div className="py-8 sm:py-12 container mx-auto px-4 sm:px-14">
          {/* Mobile/Tablet: Centered Logo */}
          <div className="md:hidden w-full flex flex-col items-center mb-6">
            <Logo className="w-[64px] mb-4 mx-auto" />
          </div>
          {/* Mobile/Tablet: 2x2 grid, Desktop: flex row */}
          <div className="hidden md:flex justify-between items-start gap-6 sm:gap-12">
            {/* Logo Column - desktop only */}
            <div className="col-span-1 flex flex-col items-start mb-4 lg:mb-0 w-full md:w-auto">
              <Logo className="w-[64px] mb-4" />
            </div>
            {/* Overview Column */}
            <div className="mb-6 lg:mb-0 w-full md:w-auto">
              <h3
                style={{
                  fontFamily: "Segoe UI, sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  color: "#191919",
                  letterSpacing: 0,
                }}
                className="mb-2 sm:mb-4 text-[18px] sm:text-[20px] lg:text-[24px]"
              >
                {t("overview")}
              </h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link
                    href="/product"
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("product")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partners"
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("partners")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials Column */}
            <div className="mb-6 lg:mb-0 w-full md:w-auto">
              <h3
                style={{
                  fontFamily: "Segoe UI, sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  color: "#191919",
                  letterSpacing: 0,
                }}
                className="mb-2 sm:mb-4 text-[18px] sm:text-[20px] lg:text-[24px]"
              >
                {t("socials")}
              </h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("linkedin")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("x")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contacts Column */}
            <div className="mb-6 lg:mb-0 w-full md:w-auto">
              <h3
                style={{
                  fontFamily: "Segoe UI, sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  color: "#191919",
                  letterSpacing: 0,
                }}
                className="mb-2 sm:mb-4 text-[18px] sm:text-[20px] lg:text-[24px]"
              >
                {t("contact")}
              </h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <a
                    href={`mailto:${t("email")}`}
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("email")}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${t("phone")}`}
                    style={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontWeight: 400,
                      fontSize: 18,
                      color: "#5D5D5D",
                      letterSpacing: 0,
                    }}
                    className="hover:text-gray-900 transition-colors text-[16px] sm:text-[18px] lg:text-[24px]"
                  >
                    {t("phone")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Join Team Column */}
            <div className="mb-4 lg:mb-0 w-full md:w-auto">
              <h3
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#191919",
                  letterSpacing: 0,
                  textAlign: "left",
                }}
                className="mb-4 text-[18px] sm:text-[20px] lg:text-[24px]"
              >
                {t("joinTeamTitle")}
              </h3>
              <Button
                variant="outline"
                className="bg-[#191919] cursor-pointer text-[#EAEAEA] rounded-[9px] h-[40px] sm:h-[45px] px-6 sm:px-8 flex items-center justify-start mt-2 text-[7px] sm:text-[16.1px] lg:text-[16.1px]"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 16.1,
                  fontWeight: 600,
                  letterSpacing: 0,
                  border: "none",
                  boxShadow: "none",
                }}
              >
                {t("seeOpenRoles")}{" "}
                <ArrowRight className="w-[15px] h-[15px] sm:w-[16.1px] sm:h-[16.1px]" />
              </Button>
            </div>
          </div>
          {/* Mobile/Tablet: 2x2 grid for footer columns */}
          <div className="md:hidden grid grid-cols-2 gap-x-8 gap-y-6 text-center">
            {/* Overview */}
            <div>
              <h3 className="mb-2 text-[15px] font-bold">{t("overview")}</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/product"
                    className="text-[14px] text-gray-600 block"
                  >
                    {t("product")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partners"
                    className="text-[14px] text-gray-600 block"
                  >
                    {t("partners")}
                  </Link>
                </li>
              </ul>
            </div>
            {/* Socials */}
            <div>
              <h3 className="mb-2 text-[15px] font-bold">{t("socials")}</h3>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="text-[14px] text-gray-600 block">
                    {t("linkedin")}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-600 block">
                    {t("x")}
                  </a>
                </li>
              </ul>
            </div>
            {/* Contacts */}
            <div>
              <h3 className="mb-2 text-[15px] font-bold">{t("contact")}</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="mailto:legalai@legalai.uz"
                    className="text-[14px] text-gray-600 block"
                  >
                    legalai@legalai.uz
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+998914012512"
                    className="text-[14px] text-gray-600 block"
                  >
                    +998 91 401 25 12
                  </a>
                </li>
              </ul>
            </div>
            {/* Join Team */}
            <div>
              <h3 className="mb-2 text-[15px] font-bold">
                {t("joinTeamTitle")}
              </h3>
              <Button
                variant="outline"
                className="bg-[#191919] cursor-pointer text-[#EAEAEA] rounded-[9px] h-[38px] px-4 flex items-center justify-center mt-2 text-[14px] font-semibold w-full"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: 0,
                  border: "none",
                  boxShadow: "none",
                }}
              >
                {t("seeOpenRoles")}{" "}
                <ArrowRight className="w-[14px] h-[14px] ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="container mx-auto px-4 sm:px-14 py-6">
        <div className="flex flex-col items-center gap-1 text-center md:flex-row md:justify-between md:items-center md:text-left md:gap-4">
          <p className="text-sm text-gray-500">{t("allRightsReserved")}</p>
          <p className="text-sm text-gray-500">{t("stockholm")}</p>
        </div>
      </div>
    </footer>
  );
}
