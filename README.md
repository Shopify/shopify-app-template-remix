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
