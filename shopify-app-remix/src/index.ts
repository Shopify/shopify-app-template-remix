import semver from "semver";
import "./shopify-api-adapter";
import {
  ConfigInterface as ApiConfig,
  ConfigParams,
  FeatureDeprecatedError,
  LATEST_API_VERSION,
  Shopify,
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
import { authenticateStorefrontFactory } from "./auth/storefront/authenticate";

export { ShopifyApp } from "./types";

export {
  LATEST_API_VERSION,
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
} from "@shopify/shopify-api";

export function shopifyApp<
  Config extends AppConfigArg<Resources, Storage>,
  Resources extends ShopifyRestResources,
  Storage extends SessionStorage
>(appConfig: Config): ShopifyApp<Config> {
  const api = deriveApi<Resources>(appConfig);
  const config = deriveConfig<Storage>(appConfig, api.config);
  const logger = overrideLoggerPackage(api.logger);

  if (appConfig.webhooks) {
    // TODO: The any is a temporary workaround until the library supports the new webhook format
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28352645
    api.webhooks.addHandlers(appConfig.webhooks as any);
  }

  const params: BasicParams = { api, config, logger };
  const oauth = new AuthStrategy<Config, Resources>(params);

  // TODO: Should we be returning the api object as part of this response? How can apps get session ids otherwise?
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28353887
  // TODO: Make sure to comment on each exported function out of this object
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28354989
  return {
    config,
    registerWebhooks: registerWebhooksFactory(params),
    authenticate: {
      admin: oauth.authenticateAdmin.bind(oauth),
      storefront: authenticateStorefrontFactory(params),
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
  const appUrl = new URL(appConfig.appUrl);
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
  return {
    ...appConfig,
    ...apiConfig,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: (appConfig.sessionStorage ??
      new SQLiteSessionStorage("database.sqlite")) as unknown as Storage,
    // TODO: Replace these settings with just a prefix, and "hardcode" the actual paths
    // E.g: User passes /auth, and we derive /auth/callback, /auth/session-token, etc
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28356500
    auth: {
      path: appConfig.auth?.path || "/auth",
      callbackPath: appConfig.auth?.callbackPath || "/auth/callback",
      sessionTokenPath:
        appConfig.auth?.sessionTokenPath || "/auth/session-token",
      exitIframePath: appConfig.auth?.exitIframePath || "/auth/exit-iframe",
    },
  };
}

// TODO This has been copied from shopify-app-express, it should be extracted into a shared package
// https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28358070
function overrideLoggerPackage(logger: Shopify["logger"]): Shopify["logger"] {
  const baseContext = { package: "shopify-app" };

  const warningFunction: Shopify["logger"]["warning"] = (
    message,
    context = {}
  ) => logger.warning(message, { ...baseContext, ...context });

  function deprecated(warningFunction: Shopify["logger"]["warning"]) {
    return function (version: string, message: string): Promise<void> {
      if (semver.gte(SHOPIFY_REMIX_LIBRARY_VERSION, version)) {
        throw new FeatureDeprecatedError(
          `Feature was deprecated in version ${version}`
        );
      }

      return warningFunction(`[Deprecated | ${version}] ${message}`);
    };
  }

  return {
    ...logger,
    log: (severity, message, context = {}) =>
      logger.log(severity, message, { ...baseContext, ...context }),
    debug: (message, context = {}) =>
      logger.debug(message, { ...baseContext, ...context }),
    info: (message, context = {}) =>
      logger.info(message, { ...baseContext, ...context }),
    warning: warningFunction,
    error: (message, context = {}) =>
      logger.error(message, { ...baseContext, ...context }),
    deprecated: deprecated(warningFunction),
  };
}
