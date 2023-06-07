import React from "react";
import { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import i18nextOptions from "./utils/i18nextOptions";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import {
  loadLocalePolyfills,
  loadPluralRulesPolyfills,
} from "./utils/intlPolyfills";

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
  if (!i18next.isInitialized) {
    await i18next
      .use(initReactI18next)
      .use(ShopifyFormat)
      .use(LanguageDetector)
      .use(Backend)
      .init({
        ...i18nextOptions,
        backend: { loadPath: "locales/{{lng}}.json" },
        detection: {
          order: ["htmlTag"],
          caches: [],
        },
      });
  }
  await loadPluralRulesPolyfills(i18nextOptions.fallbackLng, i18next.language);
}

initI18n().then(hydrate);
