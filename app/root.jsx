import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { json } from "@remix-run/node";
import remixI18n from "./i18next.server";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const locale = await remixI18n.getLocale(request);
  const apiKey = process.env.SHOPIFY_API_KEY;
  const polarisTranslations = require(`@shopify/polaris/locales/${locale}.json`);
  return json({ apiKey, locale, polarisTranslations });
}

export default function App() {
  const { apiKey, locale, polarisTranslations } = useLoaderData();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale != i18n.language) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
          data-api-key={apiKey}
        />
      </head>
      <body>
        <PolarisAppProvider i18n={polarisTranslations}>
          <Outlet />
        </PolarisAppProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
