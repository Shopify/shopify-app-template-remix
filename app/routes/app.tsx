import React, { useState } from "react";
import { type LinksFunction, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

import remixI18n from "../i18n/i18next.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export const handle = {
  useAppBridge: true,
};

export async function loader({ request }) {
  const locale = await remixI18n.getLocale(request);
  const url = new URL(request.url);

  return json({
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
    apiKey: process.env.SHOPIFY_API_KEY as string,
    host: url.searchParams.get("host") as string,
  });
}

export default function App() {
  const { polarisTranslations } = useLoaderData<typeof loader>();
  const { apiKey, host } = useLoaderData<typeof loader>();
  const [config] = useState({ host, apiKey });

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
        data-api-key={apiKey}
      />
      <ui-nav-menu>
        <Link to="/app/localization">Localization</Link>
      </ui-nav-menu>
      <PolarisAppProvider i18n={polarisTranslations}>
        <AppBridgeReactProvider config={config}>
          <Outlet />
        </AppBridgeReactProvider>
      </PolarisAppProvider>
    </>
  );
}
