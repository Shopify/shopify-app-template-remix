import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import translations from '@shopify/polaris/locales/en.json';
import {AppProvider as PolarisAppProvider} from '@shopify/polaris';
import polarisStyles from '@shopify/polaris/build/esm/styles.css';
import {json} from '@remix-run/node';

export const meta = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const links = () => [{rel: 'stylesheet', href: polarisStyles}];

export function loader() {
  const apiKey = process.env.SHOPIFY_API_KEY;
  return json({apiKey});
}

export default function App() {
  const {apiKey} = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
          data-api-key={apiKey}
        />
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
