import { i18nextServer } from "@shopify/shopify-app-remix/i18n";

import resourcesToBackend from "i18next-resources-to-backend";

export const backend = resourcesToBackend(async (locale, _namespace) => {
  switch (locale) {
    case "en":
      return (await import("./locales/en.json")).default;
    case "de":
      return (await import("./locales/de.json")).default;
    case "fr":
      return (await import("./locales/fr.json")).default;
  }
});

export const i18nextServerOptions = {
  /**
   * @see Available Shopify Admin languages in the Shopify Help Center:
   * https://help.shopify.com/en/manual/your-account/languages#available-languages
   */
  supportedLngs: ["en", "de", "fr"],
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
