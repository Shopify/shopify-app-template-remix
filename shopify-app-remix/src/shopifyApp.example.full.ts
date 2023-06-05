import {
  BillingInterval,
  DeliveryMethod,
  LATEST_API_VERSION,
  shopifyApp,
} from "@shopify/shopify-app-remix";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

export const MONTHLY_PLAN = "Monthly plan";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  isCustomStoreApp: true,
  // For custom apps
  adminApiAccessToken: "admin-api-access-token",
  // Global setting for Storefront API
  privateAppStorefrontAccessToken: "private-app-storefront-access-token",
  apiVersion: LATEST_API_VERSION,
  authPathPrefix: "/custom/auth/path",
  isEmbeddedApp: true,
  useOnlineTokens: true,
  sessionStorage: new SQLiteSessionStorage("/path/to/database.sqlite"),
  userAgentPrefix: "My Custom App",
  restResources,
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
  webhooks: {
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      includeFields: ["id", "title"],
    },
  },
  billing: {
    [MONTHLY_PLAN]: {
      amount: 10,
      currencyCode: "CAD",
      interval: BillingInterval.Every30Days,
      trialDays: 5,
    },
  },
});
