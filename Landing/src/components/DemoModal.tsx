"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { User, Mail, Building, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = ["personal", "company", "datetime"];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const t = useTranslations("Demo");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    companySize: "",
    useCase: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const validateStep = () => {
    if (step === 0) {
      return formData.firstName && formData.lastName && formData.email;
    }
    if (step === 1) {
      return formData.company && formData.companySize && formData.useCase;
    }
    if (step === 2) {
      return formData.preferredDate && formData.preferredTime;
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
    if (!validateStep()) {
      toast.error(t("fillAllFields"));
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("demoTitle")}
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
            <p className="text-gray-600 text-sm mb-6">{t("demoDescription")}</p>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                  placeholder={t("emailPlaceholder")}
                />
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("companyPlaceholder")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="companySize"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("companySize")}
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  required
                  className="min-w-[180px] w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                >
                  <option value="">{t("selectCompanySize")}</option>
                  <option value="1-10">1-10 {t("employees")}</option>
                  <option value="11-50">11-50 {t("employees")}</option>
                  <option value="51-200">51-200 {t("employees")}</option>
                  <option value="201-1000">201-1000 {t("employees")}</option>
                  <option value="1000+">1000+ {t("employees")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="useCase"
                className="text-sm font-medium text-gray-700"
              >
                {t("useCase")}
              </label>
              <textarea
                id="useCase"
                name="useCase"
                value={formData.useCase}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all resize-none"
                placeholder={
                  t("useCaseShortPlaceholder") || t("useCasePlaceholder")
                }
              />
            </div>
          </div>
        )}
        {/* Step 3: Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="preferredDate"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("preferredDate")}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                    placeholder={t("datePlaceholder")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="preferredTime"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("preferredTime")}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none focus:outline-none transition-all"
                  >
                    <option value="">{t("selectTime")}</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>
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
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                t("bookDemoButton")
              )}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
