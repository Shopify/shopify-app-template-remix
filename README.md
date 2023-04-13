# App

This project contains a Shopify App powered by [Remix](https://remix.run/).

# DISCALIMER
**Do not use this in production.**

This is incomplete. It is a proof of concept. Use this for prototyping with the knowledge that:

1. OAuth is incomplete.  Some authentication flows are missing and this will break your app.  If this happens, delete the token from prisma and delete your app and re-install.
2. Package names and API designs wll change.
3. There will be bugs, poor developer experiences and you may have to debug things on your own.

We'll throw most of this code away as we move to build.  Instead, we'll build in https://github.com/Shopify/shopify-app-template-remix and in https://github.com/Shopify/cli and on top of shopify-api-js.  We are hoping to have something production ready in late June.

But! If you're ready for life on the bleeding edge and your project can take that... we'd love your feedback.

## Set up

1. Install dependencies: `pnpm/yarn/npm install`.
2. Run `pnpm/yarn/npm dev`.

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
