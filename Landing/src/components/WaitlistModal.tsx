"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Building,
  Users,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const t = useTranslations("Waitlist");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    teamSize: "",
    useCase: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsSubmitted(true);

    // Close modal after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="text-center py-8"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.12, duration: 0.22, ease: "easeOut" }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("successTitle")}
            </h3>
            <p className="text-gray-600">{t("successMessage")}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{t("earlyAccessBenefit")}</span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="bg-black text-white hover:bg-gray-800"
          >
            {t("closeButton")}
          </Button>
        </motion.div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("waitlistTitle")}
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Benefits */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("benefitsTitle")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("benefitsDescription")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {t("benefit1Title")}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t("benefit1Description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {t("benefit2Title")}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t("benefit2Description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {t("benefit3Title")}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t("benefit3Description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  2,847
                </div>
                <div className="text-xs text-gray-600">{t("peopleJoined")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-600 text-sm mb-6">
              {t("waitlistDescription")}
            </p>

            {/* Name Fields */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder={t("lastNamePlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            {/* Company & Role */}
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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

            {/* Team Size */}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
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

            {/* Use Case */}
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder={t("useCasePlaceholder")}
              />
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
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t("joinWaitlistButton")}</span>
                </div>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              {t("waitlistNote")}
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}
