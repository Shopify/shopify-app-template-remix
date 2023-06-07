import { RemixI18Next } from "remix-i18next";
import i18nextOptions from "./utils/i18nextOptions";
import Backend from "i18next-fs-backend";
import { resolve } from "path";

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nextOptions.supportedLngs,
    fallbackLanguage: i18nextOptions.fallbackLng,
    searchParamKey: "locale",
  },
  i18next: {
    ...i18nextOptions,
    backend: { loadPath: resolve("./public/locales/{{lng}}.json") },
  },
  backend: Backend,
});

export default i18next;
