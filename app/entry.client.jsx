import { startTransition, StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { initI18nextClient } from "@shopify/shopify-app-remix/i18n";

import { i18nextClientOptions, backend } from "./i18n/config";

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
  const i18next = await initI18nextClient(i18nextClientOptions);
  await i18next.use(initReactI18next).use(backend).init(i18nextClientOptions);

  return i18next;
}

initI18n()
  .then(hydrate)
  .catch((error) => console.log(error));
