# App

This project contains a Shopify App powered by [Remix](https://remix.run/).

# WIP

This is still WIP. API's may change, and you'll need to update the shopify-app-remix package once we release it.

But it's fairly stable now, so let's start dog fooding ASAP. We can support you with maintenance caused by any shifting API's.

## Set up

1. In `package.json`, remove the line that reads `"@shopify/shopify-app-remix": "file:shopify-app-remix/shopify-shopify-app-remix-1.0.0.tgz"`.
1. Install dependencies: `npm install`.
1. Run `npm run setup`
1. Run `(cd shopify-app-remix && npm install && npm run build && npm pack) && npm add ./shopify-app-remix/shopify-shopify-app-remix-1.0.0.tgz && npm run dev`.

> **Note**: You must use `npm` to build the `shopify-app-remix` package while it is internal, because `yarn pack` does not work properly.

## Resources

- [Shopify App Remix]('./shopify-app-remix/README.md)
- [Remix Docs](https://remix.run/docs/en/v1)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
  - [`i18next` Docs](https://www.i18next.com/)
    - [Configuration options](https://www.i18next.com/overview/configuration-options)
  - [`react-i18next` Docs](https://react.i18next.com/)
    - [`useTranslation` hook](https://react.i18next.com/latest/usetranslation-hook)
  - [`remix-i18next`](https://github.com/sergiodxa/remix-i18next)
  - [`@shopify/i18next-shopify`](https://github.com/Shopify/i18next-shopify), a plugin for `i18next` that allows translation files to follow the same JSON schema used by Shopify [app extensions](https://shopify.dev/docs/apps/checkout/best-practices/localizing-ui-extensions#how-it-works) and [themes](https://shopify.dev/docs/themes/architecture/locales/storefront-locale-files#usage)
  - [`FormatJS Intl API Polyfills`](https://formatjs.io/docs/polyfills/)
