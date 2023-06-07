import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import React from "react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import remixI18n from "./i18next.server";

export const meta: MetaFunction = ({ data }) => ({
  charset: "utf-8",
  title: data.title,
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export async function loader({ request }) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const t = await remixI18n.getFixedT(request);
  const title = t("Index.title");
  const locale = await remixI18n.getLocale(request);
  const polarisTranslations = require(`@shopify/polaris/locales/${locale}.json`);
  return json({ apiKey, title, locale, polarisTranslations });
}

export default function App() {
  const { apiKey, locale, polarisTranslations } = useLoaderData();
  const { i18n } = useTranslation();

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
