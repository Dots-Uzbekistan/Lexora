import { useTranslations } from "next-intl";

export default function Vision() {
  const t = useTranslations("Vision");

  return (
    <section className="py-[100px] px-4 sm:py-[214px] sm:px-14 bg-[#F5F5F5]">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-start gap-2">
          {/* Left: Vision Label */}
          <div className="min-w-[100px] sm:min-w-[270px]">
            <h2 className="text-[19px] leading-[19px] font-regular text-[#5D5D5D] mb-2 sm:mb-4 lg:mb-0">
              {t("title")}
            </h2>
          </div>

          {/* Right: Vision Content */}
          <div className="w-full md:max-w-[780px]">
            <div className="flex flex-col">
              <p
                style={{ fontFamily: "Playfair Display, serif" }}
                className="text-[34px] text-[#191919] font-normal leading-snug sm:leading-[44px] tracking-[0] text-left mb-9"
              >
                {t("vision1")}
              </p>
              <p
                style={{ fontFamily: "Playfair Display, serif" }}
                className="text-[34px] text-[#191919] font-normal leading-snug sm:leading-[44px] tracking-[0] text-left mb-2"
              >
                {t("vision2")}
              </p>
              <p
                style={{ fontFamily: "Playfair Display, serif" }}
                className="text-[34px] text-[#191919] font-normal leading-snug sm:leading-[44px] tracking-[0] text-left mb-14"
              >
                <span className="font-bold">{t("goalTitle")}</span>{" "}
                {t("vision3")}
              </p>
              <p className="text-[15px] sm:text-[18px] text-[#191919] font-normal text-left">
                {t("vision4")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
