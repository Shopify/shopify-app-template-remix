import React from "react";
import { type LinksFunction, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";

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

  return json({
    polarisTranslations: require(`@shopify/polaris/locales/${locale}.json`),
  });
}

export default function App() {
  const { polarisTranslations } = useLoaderData<typeof loader>();

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Outlet />
    </PolarisAppProvider>
  );
}
