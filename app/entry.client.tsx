import React from "react";
import { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import i18nextOptions from "./i18nextOptions";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import {
  loadLocalePolyfills,
  loadPluralRulesPolyfills,
} from "./utils/polyfill";

async function hydrate() {
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
          // Here only enable htmlTag detection, we'll detect the language only
          // server-side with remix-i18next, by using the `<html lang>` attribute
          // we can communicate to the client the language detected server-side
          order: ["htmlTag"],
          // Because we only use htmlTag, there's no reason to cache the language
          // on the browser, so we disable it
          caches: [],
        },
      });
  }
  await loadPluralRulesPolyfills(i18nextOptions.fallbackLng, i18next.language);

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

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
