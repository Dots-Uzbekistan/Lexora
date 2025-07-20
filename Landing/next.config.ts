import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
};

export default withNextIntl(config);
