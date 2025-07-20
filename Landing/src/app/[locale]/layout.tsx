import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/styles.css";
import { Inter, Domine } from "next/font/google";
import { locales } from "@/i18n/locales";
import { hasLocale } from "next-intl";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const domine = Domine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-domine",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LocaleLayout" });

  // Base URL for canonical and og:url
  const baseUrl = "https://lexora.uz";
  const url = `${baseUrl}/${locale}`;
  const ogImage = `${baseUrl}/public/hero.png`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        uz: `${baseUrl}/uz`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url,
      siteName: "Lexora AI",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Lexora AI Logo",
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
      site: "@lexoraai",
    },
    other: {
      "og:type": "website",
      "og:locale": locale,
      "og:site_name": "Lexora AI",
      "twitter:card": "summary_large_image",
      "twitter:site": "@lexoraai",
      "twitter:creator": "@lexoraai",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!hasLocale(locales, locale)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Lexora AI",
              url: "https://lexora.ai",
              logo: "https://lexora.ai/public/logo.svg",
              sameAs: [
                "https://www.linkedin.com/company/lexoraai/",
                "https://twitter.com/lexoraai",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${domine.variable} font-sans bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages as AbstractIntlMessages}
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
