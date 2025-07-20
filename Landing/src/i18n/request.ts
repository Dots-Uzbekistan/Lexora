import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// If you like, add:  import {hasLocale} from 'next-intl';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback to default if the value is missing or unsupported
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
