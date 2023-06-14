import "./shopify-api-adapter";
import {
  ConfigInterface as ApiConfig,
  ConfigParams,
  LATEST_API_VERSION,
  Shopify,
  ShopifyError,
  ShopifyRestResources,
  shopifyApi,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

import { AppConfig, AppConfigArg } from "./config-types";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "./version";
import { BasicParams, MandatoryTopics, ShopifyApp } from "./types";
import { registerWebhooksFactory } from "./auth/webhooks";
import { AuthStrategy } from "./auth/admin/authenticate";
import { authenticateWebhookFactory } from "./auth/webhooks/authenticate";
import { authenticatePublicFactory } from "./auth/public/authenticate";
import { overrideLogger } from "./override-logger";
import { addResponseHeadersFactory } from "./auth/helpers/add-response-headers";

export { ShopifyApp } from "./types";

export {
  LATEST_API_VERSION,
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
} from "@shopify/shopify-api";

/**
 * Creates an object your app will use to interact with Shopify.
 *
 * @param appConfig Configuration options for your shopify app.  For example, the scopes your app needs.
 * @returns `ShopifyApp` An object constructed using your appConfig.  It has methods for interacting with Shopify.
 *
 * @example
 * The minimum viable configuration
 * ```ts
 * import { shopifyApp } from "@shopify/shopify-app-remix";
 *
 * export const shopify = shopifyApp({
 *   apiKey: process.env.SHOPIFY_API_KEY!,
 *   apiSecretKey: process.env.SHOPIFY_API_SECRET!,
 *   scopes: process.env.SCOPES?.split(",")!,
 *   appUrl: process.env.SHOPIFY_APP_URL!,
 * });
 * ```
 */
export function shopifyApp<
  Config extends AppConfigArg<Resources, Storage>,
  Resources extends ShopifyRestResources,
  Storage extends SessionStorage
>(appConfig: Config): ShopifyApp<Config> {
  const api = deriveApi<Resources>(appConfig);
  const config = deriveConfig<Storage>(appConfig, api.config);
  const logger = overrideLogger(api.logger);

  if (appConfig.webhooks) {
    api.webhooks.addHandlers(appConfig.webhooks);
  }

  const params: BasicParams = { api, config, logger };
  const oauth = new AuthStrategy<Config, Resources>(params);

  return {
    sessionStorage: config.sessionStorage,
    addResponseHeaders: addResponseHeadersFactory(params),
    registerWebhooks: registerWebhooksFactory(params),
    authenticate: {
      admin: oauth.authenticateAdmin.bind(oauth),
      public: authenticatePublicFactory(params),
      webhook: authenticateWebhookFactory<
        Resources,
        keyof Config["webhooks"] | MandatoryTopics
      >(params),
    },
  };
}

function deriveApi<Resources extends ShopifyRestResources>(
  appConfig: AppConfigArg
): Shopify<Resources> {
  let appUrl: URL;
  try {
    appUrl = new URL(appConfig.appUrl);
  } catch (error) {
    throw new ShopifyError(
      "Invalid appUrl provided. Please provide a valid URL."
    );
  }

  if (appUrl.hostname === "localhost" && !appUrl.port && process.env.PORT) {
    appUrl.port = process.env.PORT;
  }
  appConfig.appUrl = appUrl.origin;

  let userAgentPrefix = `Shopify Remix Library v${SHOPIFY_REMIX_LIBRARY_VERSION}`;
  if (appConfig.userAgentPrefix) {
    userAgentPrefix = `${appConfig.userAgentPrefix} | ${userAgentPrefix}`;
  }

  const cleanApiConfig: ConfigParams = {
    ...appConfig,
    hostName: appUrl.host,
    hostScheme: appUrl.protocol.replace(":", "") as "http" | "https",
    userAgentPrefix,
    isEmbeddedApp: appConfig.isEmbeddedApp ?? true,
    apiVersion: appConfig.apiVersion ?? LATEST_API_VERSION,
  };

  return shopifyApi<Resources>(cleanApiConfig);
}

function deriveConfig<Storage extends SessionStorage>(
  appConfig: AppConfigArg,
  apiConfig: ApiConfig
): AppConfig<Storage> {
  const authPathPrefix = appConfig.authPathPrefix || "/auth";

  return {
    ...appConfig,
    ...apiConfig,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: (appConfig.sessionStorage ??
      new SQLiteSessionStorage("database.sqlite")) as unknown as Storage,
    auth: {
      path: authPathPrefix,
      callbackPath: authPathPrefix + "/callback",
      patchSessionTokenPath: authPathPrefix + "/session-token",
      exitIframePath: authPathPrefix + "/exit-iframe",
    },
  };
}
