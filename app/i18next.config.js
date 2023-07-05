import { resolve } from "path";

export default {
  backend: {
    loadPath: resolve("./app/locales/{{lng}}.json"),
  },
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: { useSuspense: false },
  /**
   * Supported languages should correspond with the JSON files in the `app/locales` folder.
   *
   * @see Available Shopify Admin languages in the Shopify Help Center:
   * https://help.shopify.com/en/manual/your-account/languages#available-languages
   */
  supportedLngs: ["de", "en", "fr"],
  fallbackLng: "en",
  detection: {
    order: ["htmlTag"],
    caches: [],
  },
};
