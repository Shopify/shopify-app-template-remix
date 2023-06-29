import React, { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import i18nextOptions from "./i18nextOptions";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { clientMiddlewares } from "@shopify/shopify-app-remix/i18n";

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
  await [
    initReactI18next,
    ...(await clientMiddlewares()),
    resourcesToBackend(async (locale, _namespace) => {
      switch (locale) {
        case "en":
          return (await import("./locales/en.json")).default;
        case "de":
          return (await import("./locales/de.json")).default;
        case "fr":
          return (await import("./locales/fr.json")).default;
      }
    }),
  ]
    .reduce((acc, middleware) => acc.use(middleware), i18next)
    .init(i18nextOptions);
}

initI18n().then(hydrate);
