import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await authenticate.admin(request);

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
  if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
    return errorHeaders;
  }

  // Ensure all of the headers Shopify needs are set for embedded app requests
  return new Headers([
    ...(parentHeaders ? Array.from(parentHeaders.entries()) : []),
    ...(loaderHeaders ? Array.from(loaderHeaders.entries()) : []),
    ...(actionHeaders ? Array.from(actionHeaders.entries()) : []),
  ]);
};
