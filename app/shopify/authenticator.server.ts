import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/node";

import { Context, app } from "./app.server";

// Shopify won't use this session storage for OAuth because Shopify's library handles that internally. If you're
// integrating with other providers, you can use this session storage to store the OAuth token.
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__state",
    secrets: [app.config.apiSecretKey],
    sameSite: "lax",
  },
});
const authenticator = new Authenticator<Context>(sessionStorage);

authenticator.use(new app.auth.OAuth(), "shopify-app");

// authenticator.use(new app.auth.Webhook(), "shopify-webhook");

// TODO Add a billing strategy that takes in a session and exports billing functionality

export { authenticator };
