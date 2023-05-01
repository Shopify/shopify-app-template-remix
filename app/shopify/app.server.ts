import { shopifyApp } from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

import prisma from "~/db.server";

export const app = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new PrismaSessionStorage(prisma),
  isEmbeddedApp: true,
  appUrl: process.env.SHOPIFY_APP_URL!,
  auth: {
    path: process.env.SHOPIFY_APP_AUTH_AUTHORIZATION_PATH,
    callbackPath: process.env.SHOPIFY_APP_AUTH_CALLBACK_PATH,
  },
});
