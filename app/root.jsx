import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import translations from "@shopify/polaris/locales/en.json";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { json } from "@remix-run/node";

export const meta = () => ({
  charset: "utf-8",
  title: "App Config ToolKit",
  viewport: "width=device-width,initial-scale=1",
});

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader() {
  const apiKey = process.env.SHOPIFY_API_KEY;
  return json({ apiKey });
}

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js" />
        <Meta />
        <Links />
      </head>
      <body>
        <PolarisAppProvider i18n={translations}>
          <Outlet />
        </PolarisAppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
