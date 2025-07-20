"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onOpenSignup,
}: LoginModalProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    onClose();

    // Redirect to internal dashboard (Lexora UI)
    const uiUrl = process.env.NEXT_PUBLIC_UI_URL || "http://localhost:3000"; // fallback for local dev

    // Use full page reload to navigate across apps (avoids Next.js router limitations)
    if (typeof window !== "undefined") {
      console.log("Redirecting to", uiUrl);
      window.location.href = uiUrl;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupClick = () => {
    onClose();
    if (onOpenSignup) {
      onOpenSignup();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("loginTitle")}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
              placeholder={t("emailPlaceholder")}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            {t("password")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
              placeholder={t("passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            {t("forgotPassword")}
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-lg font-medium transition-all"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            t("loginButton")
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t("or")}</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">{t("noAccount")} </span>
          <button
            type="button"
            onClick={handleSignupClick}
            className="text-sm font-medium text-black hover:underline"
          >
            {t("signUp")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
