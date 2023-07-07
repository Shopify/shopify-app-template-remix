import { i18nextServer } from "@shopify/shopify-app-remix/i18n";

import resourcesToBackend from "i18next-resources-to-backend";

/**
 * @see Available Shopify Admin languages in the Shopify Help Center:
 * https://help.shopify.com/en/manual/your-account/languages#available-languages
 */
const resources = {
  en: async () => import("./locales/en.json"),
  de: async () => import("./locales/de.json"),
  fr: async () => import("./locales/fr.json"),
};

export const backend = resourcesToBackend(async (locale, _namespace) => {
  return (await resources[locale]()).default;
});

export const i18nextServerOptions = {
  supportedLngs: Object.keys(resources),
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false },
};

export const i18nextClientOptions = {
  ...i18nextServerOptions,
  detection: {
    order: ["htmlTag"],
    caches: [],
  },
};

export const i18nServer = i18nextServer({
  options: i18nextServerOptions,
  backend,
});
