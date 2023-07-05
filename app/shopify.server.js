import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  BillingInterval,
  DeliveryMethod,
  LogSeverity,
  shopifyApp,
} from "@shopify/shopify-app-remix";
import { i18nextServer } from "@shopify/shopify-app-remix/i18n";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import Backend from "i18next-fs-backend";

import prisma from "./db.server";
import i18nextOptions from "./i18next.config";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  logger: {
    level: LogSeverity.Debug,
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  billing: {
    monthly: {
      amount: 5,
      currencyCode: "EUR",
      interval: BillingInterval.Every30Days,
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export const i18nServer = i18nextServer({
  options: i18nextOptions,
  backend: Backend,
});
