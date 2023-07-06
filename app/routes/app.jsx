import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

import { shopify } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await shopify.authenticate.admin(request);

  return json({
    polarisTranslations: require(`@shopify/polaris/locales/en.json`),
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function App() {
  const { polarisTranslations } = useLoaderData();
  const { apiKey } = useLoaderData();

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key={apiKey}
      />
      <PolarisAppProvider i18n={polarisTranslations}>
        <Outlet />
      </PolarisAppProvider>
    </>
  );
}

// Shopify methods such as billing.require() need Remix to catch errors so headers are included in the response.
// We throw `useRouteError()` to retain Remix's default error behaviour after we've captured headers.
export function ErrorBoundary() {
  throw useRouteError();
}

export const headers = ({
  loaderHeaders,
  actionHeaders,
  errorHeaders,
  parentHeaders,
}) => {
  // Ensure all of the headers Shopify needs are set for embedded app requests
  return new Headers([
    ...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
    ...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
    ...(errorHeaders ? Array.from(errorHeaders.entries()) : []),
    ...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
  ]);
};
<<<<<<< HEAD
=======

export async function loader({ request }) {
  await shopify.authenticate.admin(request);

  const locale = await remixI18n.getLocale(request);
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
        src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
        data-api-key={apiKey}
      />
      <PolarisAppProvider i18n={polarisTranslations}>
        <AppBridgeReactProvider config={config}>
          <Outlet />
        </AppBridgeReactProvider>
      </PolarisAppProvider>
    </>
  );
}
>>>>>>> 2152c1d (Add index page, and a few minor tweaks elsewhere)
