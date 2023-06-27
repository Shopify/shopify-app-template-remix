import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import React from "react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import remixI18n from "./i18n/i18next.server";

export const meta: MetaFunction = ({ data }) => ({
  charset: "utf-8",
  title: data.title,
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }) {
  const locale = await remixI18n.getLocale(request);
  return json({
    locale,
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function App() {
  const { locale, apiKey } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  const useAppBridge = useMatches().some((match) => match.handle?.useAppBridge);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
        {useAppBridge && (
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
            data-api-key={apiKey}
          />
        )}
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}
