import {
  ShopifyApp,
  shopifyApp,
  Context as ShopifyContext,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { LATEST_API_VERSION, LogSeverity } from "@shopify/shopify-api";

import prisma from "~/db.server";

export const app = shopifyApp({
  isEmbeddedApp: true,
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new PrismaSessionStorage(prisma),
  appUrl: process.env.SHOPIFY_APP_URL!,
  useOnlineTokens: true,
  logger: {
    level: LogSeverity.Debug,
  },
  auth: {
    path: process.env.SHOPIFY_APP_AUTH_AUTHORIZATION_PATH,
    callbackPath: process.env.SHOPIFY_APP_AUTH_CALLBACK_PATH,
  },
});

// TODO is there a cleaner way of getting this type to the authenticator?
export type Context = ShopifyContext<
  typeof app extends ShopifyApp<infer T> ? T : never
>;
