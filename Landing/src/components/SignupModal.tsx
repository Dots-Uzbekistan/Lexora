"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { User, Mail, Lock, Eye, EyeOff, Building, Users } from "lucide-react";
import { toast } from "react-hot-toast";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ["personal", "company", "terms"];

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const t = useTranslations("Auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "",
    teamSize: "",
    terms: false,
  });
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setFormData({
      ...formData,
      [name]: fieldValue,
    });
    setTouched({ ...touched, [name]: true });
  };

  const validateStep = () => {
    if (step === 0) {
      return (
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword
      );
    }
    if (step === 1) {
      return formData.company && formData.role && formData.teamSize;
    }
    if (step === 2) {
      return formData.terms;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    } else {
      setTouched((t) => ({ ...t, [`step${step}`]: true }));
      toast.error(t("fillAllFields"));
    }
  };
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("signupTitle")}
      maxWidth="max-w-2xl"
    >
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                i <= step ? "bg-black" : "bg-gray-200 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            <div
              className={`h-[3px] w-full mt-1 ${
                i < step ? "bg-black" : "bg-gray-200"
              }`}
            ></div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Info */}
        {step === 0 && (
          <div className="space-y-6">
            <p className="text-gray-600 text-sm mb-6">
              {t("signupDescription")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("firstName")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("firstNamePlaceholder")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("lastName")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("lastNamePlaceholder")}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
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
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Company Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("company")}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("companyPlaceholder")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("role")}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                >
                  <option value="">{t("selectRole")}</option>
                  <option value="lawyer">{t("lawyer")}</option>
                  <option value="paralegal">{t("paralegal")}</option>
                  <option value="legal_ops">{t("legalOps")}</option>
                  <option value="general_counsel">{t("generalCounsel")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="teamSize"
                className="text-sm font-medium text-gray-700"
              >
                {t("teamSize")}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                >
                  <option value="">{t("selectTeamSize")}</option>
                  <option value="1-5">1-5 {t("people")}</option>
                  <option value="6-20">6-20 {t("people")}</option>
                  <option value="21-50">21-50 {t("people")}</option>
                  <option value="51-100">51-100 {t("people")}</option>
                  <option value="100+">100+ {t("people")}</option>
                </select>
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Terms and Submit */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
                className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t("agreeToTerms")}{" "}
                <a href="#" className="text-black hover:underline">
                  {t("termsOfService")}
                </a>{" "}
                {t("and")}{" "}
                <a href="#" className="text-black hover:underline">
                  {t("privacyPolicy")}
                </a>
              </label>
            </div>
          </div>
        )}
        {/* Sticky Footer Navigation */}
        <div className="sticky bottom-0 left-0 bg-white pt-4 pb-2 flex gap-2 z-10">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              {t("back")}
            </Button>
          )}
          {step < steps.length - 1 && (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {t("next")}
            </Button>
          )}
          {step === steps.length - 1 && (
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800 py-3 rounded-lg font-medium transition-all"
              disabled={isLoading || !validateStep()}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                t("signupButton")
              )}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
