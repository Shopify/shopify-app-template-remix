import React, { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import i18nextOptions from "./i18n/i18nextOptions";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import {
  loadLocalePolyfills,
  loadPluralRulesPolyfills,
} from "./i18n/intlPolyfills";

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18next}>
          <RemixBrowser />
        </I18nextProvider>
      </StrictMode>
    );
  });
}

async function initI18n() {
  await loadLocalePolyfills();
  await i18next
    .use(initReactI18next)
    .use(ShopifyFormat)
    .use(LanguageDetector)
    .use(
      resourcesToBackend(async (locale, _namespace) => {
        switch (locale) {
          case "en":
            return (await import("./locales/en.json")).default;
          case "de":
            return (await import("./locales/de.json")).default;
          case "fr":
            return (await import("./locales/fr.json")).default;
        }
      })
    )
    .init({
      ...i18nextOptions,
      detection: {
        order: ["htmlTag"],
        caches: [],
      },
    });
  await loadPluralRulesPolyfills(i18nextOptions.fallbackLng, i18next.language);
}

initI18n().then(hydrate);
