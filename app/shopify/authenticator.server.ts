import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/node";

import { app } from "./app.server";

// Shopify won't use this session storage for OAuth because Shopify's library handles that internally. If you're
// integrating with other providers, you can use this session storage to store the OAuth token.
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__state",
    secrets: [app.config.apiSecretKey],
    sameSite: "lax",
  },
});
const authenticator = new Authenticator(sessionStorage);

// Shopify authenticator
// const shopifyAppAuthStrategy = new ShopifyAppAuthStrategy({
//   ...app,
//   tokenStorage,
//   hooks: {
//     onAuthCompleted: async ({ admin }) =>
//       shopifyAppWebhookAuthStrategy.subscribeToTopics({ admin }),
//   },
// });
authenticator.use(new app.AuthStrategy(), "shopify-app");

// Webhook authenticator
// const shopifyAppWebhookAuthStrategy = new ShopifyAppWebhookAuthStrategy({
//   ...app,
//   tokenStorage,
// });
// authenticator.use(shopifyAppWebhookAuthStrategy, "shopify-webhook");

export { authenticator };
