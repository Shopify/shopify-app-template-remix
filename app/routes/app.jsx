import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

import { shopify } from "../shopify.server";
import { i18nServer } from "../i18n/config";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await shopify.authenticate.admin(request);

  const locale = await i18nServer.getLocale(request);
  const url = new URL(request.url);

  return json({
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
    apiKey: process.env.SHOPIFY_API_KEY,
    host: url.searchParams.get("host"),
  });
}

export default function App() {
  const { polarisTranslations } = useLoaderData();
  const { apiKey, host } = useLoaderData();
  const [config] = useState({ host, apiKey });

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge-next.js"
        data-api-key={apiKey}
      />
      <ui-nav-menu>
        <Link to="/app/internationalization">Internationalization</Link>
      </ui-nav-menu>
      <PolarisAppProvider i18n={polarisTranslations}>
        <AppBridgeReactProvider config={config}>
          <Outlet />
        </AppBridgeReactProvider>
      </PolarisAppProvider>
    </>
  );
}
