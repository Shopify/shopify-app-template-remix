import {
  BillingInterval,
  DeliveryMethod,
  LATEST_API_VERSION,
  LogSeverity,
  shopifyApp,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

// TODO figure out why this shows as an error in vscode only
// @ts-ignore
import prisma from "~/db.server";

// TODO: reduce the number of arguments you need to pass in by defaulting as many as we can
export const app = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(",")!,
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new PrismaSessionStorage(prisma),
  appUrl: process.env.SHOPIFY_APP_URL!,
  isEmbeddedApp: true,
  useOnlineTokens: true,
  restResources,
  logger: {
    level: LogSeverity.Debug,
  },
  auth: {
    path: process.env.SHOPIFY_APP_AUTH_AUTHORIZATION_PATH,
    callbackPath: process.env.SHOPIFY_APP_AUTH_CALLBACK_PATH,
  },
  webhooks: {
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      app.registerWebhooks({ session });
    },
  },
  billing: {
    remix1: {
      amount: 10,
      currencyCode: "USD",
      interval: BillingInterval.Annual,
    },
    remix2: {
      amount: 5,
      currencyCode: "EUR",
      interval: BillingInterval.Every30Days,
    },
  },
});
