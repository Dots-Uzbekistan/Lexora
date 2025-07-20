"use client";

import { useState } from "react";
import Image from "next/image";
import greenPng from "../../assets/bg_joinus.png";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import WaitlistModal from "./WaitlistModal";
import { ArrowRight } from "lucide-react";

export default function JoinUs() {
  const t = useTranslations("JoinUs");
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);

  return (
    <div className="bg-[#F5F5F5] w-full">
      <section className="container mx-auto px-4 sm:px-14 w-full bg-[#F5F5F5] pb-[80px] sm:pb-[158px]">
        <div
          className=" bg-white rounded-none relative overflow-hidden"
          style={{ boxSizing: "border-box", minHeight: 220 }}
        >
          {/* Green background image */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
              src={greenPng}
              alt="Green background"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          {/* Overlay content */}
          <div className="relative z-10 p-3 sm:p-8 md:p-10 flex flex-col gap-3 w-full">
            {/* Heading */}
            <p
              style={{ fontFamily: "Playfair Display, serif", fontWeight: 600 }}
              className="text-[22px] sm:text-[32px] md:text-[40px] lg:text-[53px] text-[#F5F5F5] font-playfair font-semibold text-left mb-2 sm:mb-4 tracking-[0]"
            >
              {t("mainTitle")}
            </p>
            <div className="w-full max-w-full sm:max-w-[90vw] md:max-w-[80vw] lg:w-[940px] h-auto sm:h-[216px] bg-[#FFFFFF]/21 p-2 sm:p-[18px] rounded-[16px] sm:rounded-[32px] mb-1">
              <div className="rounded-[10px] sm:rounded-[22.79px] bg-[#FFFFFF] flex items-center p-2 sm:p-[20px] w-full h-auto sm:h-[179px] ">
                <span
                  style={{
                    fontFamily: "Segoe UI, sans-serif",
                    color: "#191919",
                    letterSpacing: 0,
                    textAlign: "left",
                  }}
                  className="text-[13px] sm:text-[16px] md:text-[20px] lg:text-[22px]"
                >
                  {t("invite")}
                </span>
              </div>
            </div>
            <div className="w-full max-w-full sm:max-w-[530px] h-auto sm:h-[100px] bg-[#FFFFFF]/21 p-2 sm:p-3 rounded-[16px] sm:rounded-[32px] mb-3 sm:mb-6">
              <div className="rounded-[10px] sm:rounded-[22.79px] bg-[#FFFFFF] flex items-center p-2 sm:p-[20px] w-full h-auto sm:h-[76.45px] ">
                <span
                  style={{
                    fontFamily: "Segoe UI, sans-serif",
                    color: "#191919",
                    letterSpacing: 0,
                    textAlign: "left",
                  }}
                  className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px]"
                >
                  {t("readyToCoCreate")}
                </span>
              </div>
            </div>

            {/* Button Row */}
            <div className="w-full mt-4 sm:mt-2 relative">
              <div className="flex justify-center w-full lg:justify-end lg:w-auto lg:absolute lg:bottom-11 lg:right-16">
                <Button
                  onClick={() => setWaitlistModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-black text-white rounded-[12px] sm:rounded-[16px] cursor-pointer p-[14px_18px] sm:p-[22px_30px] text-[16px] sm:text-[20px] font-medium shadow-none hover:bg-black/80 w-full max-w-[220px] lg:w-auto h-[44px] sm:h-[60px]"
                >
                  {t("contactWithUs")} <ArrowRight className="w-4 h-4 mt-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistModalOpen}
        onClose={() => setWaitlistModalOpen(false)}
      />
    </div>
  );
}
