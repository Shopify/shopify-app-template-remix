import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react'
import translations from '@shopify/polaris/locales/en.json'
import {AppProvider as PolarisAppProvider} from '@shopify/polaris'
import polarisStyles from '@shopify/polaris/build/esm/styles.css'

export const meta = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
})

export const links = () => [{rel: 'stylesheet', href: polarisStyles}]

export default function App() {
  return (
    <html lang="en">
      <head>
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
  )
}
