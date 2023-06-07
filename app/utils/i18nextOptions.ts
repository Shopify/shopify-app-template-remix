import { resolve } from "path";

export default {
  backend: {
    loadPath: resolve("./app/locales/{{lng}}.json"),
  },
  debug: process.env.NODE_ENV !== "production",
  /**
   * The default locale for the app.
   */
  fallbackLng: "en",
  react: { useSuspense: false },
  /**
   * The supported locales for the app.
   *
   * These should correspond with the JSON files in the `public/locales` folder.
   *
   * @see Available Shopify Admin languages in the Shopify Help Center:
   * https://help.shopify.com/en/manual/your-account/languages#available-languages
   */
  supportedLngs: ["de", "en", "fr"],
};
