"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { Logo } from "../../assets/icons/MainIcons";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import DemoModal from "./DemoModal";

export default function Header() {
  const t = useTranslations("Header");
  const [showDemo, setShowDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const navLinks = [
    { href: "/product", label: t("product") },
    { href: "/partners", label: t("partners") },
    { href: "/careers", label: t("careers") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowDemo(window.scrollY > 600);
    };
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openSignupModal = () => {
    setSignupModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openDemoModal = () => {
    setDemoModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#F5F5F5] border-b border-[#5D5D5D] ">
        {/* Header Main Row: logo, nav, controls */}
        <div className="flex container mx-auto items-center py-[10px] px-4 sm:px-11 ">
          {/* Logo - Always visible, left-aligned on desktop, centered on mobile */}
          <div className="flex items-center lg:mx-0 justify-center sm:justify-start">
            <Link href="/" className="flex items-center">
              <Logo className="w-[46px] h-[24px] ml-3" />
            </Link>
          </div>
          {/* Desktop Navigation - Centered but shifted further right */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-4  ml-20 xl:ml-38">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                href={navLink.href}
                className="font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: 15 }}
              >
                {navLink.label}
              </Link>
            ))}
          </nav>
          {/* Desktop Right Controls */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 justify-end ml-4">
            <button
              onClick={openLoginModal}
              type="button"
              className="text-[#191919] bg-white transition-all duration-200 rounded-[7px] font-medium py-[5px] px-[10px]"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: 14 }}
            >
              {t("login")}
            </button>

            {showDemo && (
              <Button
                variant="outline"
                onClick={openDemoModal}
                className="border-black text-black hover:bg-black hover:text-white rounded-[7px] font-medium"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: 14 }}
              >
                {t("bookDemo")}
              </Button>
            )}
            <LanguageSelector />
          </div>
          {/* Mobile Controls (menu, language) */}
          <div className="lg:hidden flex items-center gap-3 flex-shrink-0 absolute right-3 top-1/2 -translate-y-1/2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleMenu}
              className="p-4 rounded-full hover:bg-gray-100 transition-colors duration-200 w-10 h-10 flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-20 h-20" />
              ) : (
                <Menu className="w-20 h-20" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile Menu (unchanged) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dark overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Modern Drawer */}
              <motion.div
                initial={{ opacity: 0, x: 64 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 64 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-[340px] bg-white/95 backdrop-blur-md rounded-tl-3xl rounded-bl-3xl shadow-2xl z-50 flex flex-col px-6 py-6"
                style={{ maxWidth: 340 }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8" />
                </button>
                {/* Nav Links */}
                <nav className="flex flex-col space-y-2 mt-8">
                  {navLinks.map((navLink) => (
                    <Link
                      key={navLink.href}
                      href={navLink.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2 py-3 text-lg font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {navLink.label}
                    </Link>
                  ))}
                </nav>
                {/* Divider */}
                <div className="border-t border-gray-200 my-4" />
                {/* Action Buttons at Bottom */}
                <div className="absolute left-0 right-0 bottom-0 px-6 pb-8 flex flex-col space-y-3">
                  <Button
                    variant="ghost"
                    onClick={openLoginModal}
                    className="w-full justify-center text-[#191919] bg-[#F5F5F5] hover:bg-[#e5e5e5] rounded-xl px-6 h-12 font-medium text-lg"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {t("login")}
                  </Button>
                  <Button
                    onClick={openSignupModal}
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-xl px-6 h-12 font-medium text-lg"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {t("signUp")}
                  </Button>
                  {showDemo && (
                    <Button
                      variant="outline"
                      onClick={openDemoModal}
                      className="w-full border-black text-black hover:bg-black hover:text-white rounded-xl px-6 h-12 font-medium text-lg"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {t("bookDemo")}
                    </Button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenSignup={() => setSignupModalOpen(true)}
      />
      <SignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
      />
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </>
  );
}
