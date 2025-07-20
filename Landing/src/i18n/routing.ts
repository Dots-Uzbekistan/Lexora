import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from './locales';

export const routing = defineRouting({
  locales,
  defaultLocale,
});

// Re‑export the union type if you want strict typing elsewhere
export type AppLocale = (typeof routing.locales)[number];
