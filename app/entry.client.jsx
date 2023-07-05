import { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initI18nextClient } from "@shopify/shopify-app-remix/i18n";

import i18nextOptions from "./i18next.config";

function hydrate(i18next) {
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
  const i18next = await initI18nextClient(i18nextOptions);
  await i18next
    .use(initReactI18next)
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
    .init(i18nextOptions);

  return i18next;
}

initI18n()
  .then(hydrate)
  .catch((error) => console.log(error));
