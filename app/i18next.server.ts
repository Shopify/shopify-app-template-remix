import { RemixI18Next } from "remix-i18next";
import i18nextOptions from "./i18nextOptions";
import Backend from "i18next-fs-backend";
import { resolve } from "path";

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nextOptions.supportedLngs,
    fallbackLanguage: i18nextOptions.fallbackLng,
    // Use the `locale` query parameter to detect the language
    searchParamKey: "locale",
  },
  // Server side i18next configuration
  i18next: {
    ...i18nextOptions,
    backend: { loadPath: resolve("./public/locales/{{lng}}.json") },
  },
  // The backend you want to use to load the translations
  // Tip: You could pass `resources` to the `i18next` configuration and avoid
  // a backend here
  backend: Backend,
});

export default i18next;
