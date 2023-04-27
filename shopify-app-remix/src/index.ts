import semver from "semver";
import "./shopify-api-adapter";
import {
  ConfigParams as ApiConfigParams,
  FeatureDeprecatedError,
  LATEST_API_VERSION,
  Shopify,
  ShopifyRestResources,
  shopifyApi,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { AppConfigInterface, AppConfigParams } from "./config-types";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "./version";

export interface ShopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
> {
  config: AppConfigInterface<S>;
  api: Shopify<R>;
}

export function shopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
>(config: AppConfigParams<R, S>): ShopifyApp<R, S> {
  const { api: apiConfig, ...appConfig } = config;

  const api = shopifyApi<R>(apiConfigWithDefaults<R>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig<R, S>(appConfig, api);

  return {
    config: validatedConfig,
    api,
  };
}

function validateAppConfig<
  R extends ShopifyRestResources,
  S extends SessionStorage
>(
  config: Omit<AppConfigParams<R, S>, "api">,
  api: Shopify
): AppConfigInterface<S> {
  const { sessionStorage, ...configWithoutSessionStorage } = config;

  return {
    // We override the API package's logger to add the right package context by default (and make the call simpler)
    logger: overrideLoggerPackage(api.logger),
    sessionStorage: sessionStorage ?? new MemorySessionStorage(),
    ...configWithoutSessionStorage,
  };
}

// TODO: Everything after this point is a copy of shopify-app-express and should be moved into a shared internal package

function apiConfigWithDefaults<R extends ShopifyRestResources>(
  apiConfig: Partial<ApiConfigParams<R>>
): ApiConfigParams<R> {
  let userAgentPrefix = `Shopify Remix Library v${SHOPIFY_REMIX_LIBRARY_VERSION}`;

  if (apiConfig.userAgentPrefix) {
    userAgentPrefix = `${apiConfig.userAgentPrefix} | ${userAgentPrefix}`;
  }

  let hostName: string;
  let hostScheme: "http" | "https";
  if (apiConfig.hostName) {
    hostName = apiConfig.hostName;
    hostScheme = apiConfig.hostScheme ?? "https";
  } else {
    const hostEnvVar = process.env.SHOPIFY_APP_URL;
    const hostUrl = hostEnvVar
      ? new URL(
          hostEnvVar.startsWith("http") ? hostEnvVar : `https://${hostEnvVar}`
        )
      : undefined;

    hostName = hostUrl?.hostname ?? "localhost";
    hostScheme =
      (hostUrl?.protocol?.replace(":", "") as "http" | "https") ?? "https";
  }

  /* eslint-disable no-process-env */
  return {
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SCOPES?.split(",")!,
    hostScheme,
    hostName,
    isEmbeddedApp: true,
    apiVersion: LATEST_API_VERSION,
    ...(process.env.SHOP_CUSTOM_DOMAIN && {
      customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
    }),
    ...apiConfig,
    userAgentPrefix,
  };
  /* eslint-enable no-process-env */
}

function overrideLoggerPackage(logger: Shopify["logger"]): Shopify["logger"] {
  const baseContext = { package: "shopify-app" };

  const warningFunction: Shopify["logger"]["warning"] = (
    message,
    context = {}
  ) => logger.warning(message, { ...baseContext, ...context });

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
