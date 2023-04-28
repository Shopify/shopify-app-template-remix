import semver from "semver";
import "./shopify-api-adapter";
import {
  ConfigInterface as ApiConfig,
  FeatureDeprecatedError,
  Shopify,
  ShopifyRestResources,
  shopifyApi,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { AppConfig, AppConfigArg } from "./config-types";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "./version";
import { AuthStrategy, authStrategyFactory } from "./auth";

export interface ShopifyApp<S extends SessionStorage = SessionStorage> {
  config: AppConfig<S>;
  // TODO Extract this type into an interface
  AuthStrategy: typeof AuthStrategy;
}

export function shopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
>(appConfig: AppConfigArg<R, S>): ShopifyApp<S> {
  const api = deriveApi<R>(appConfig);
  const config = deriveConfig<S>(appConfig, api.config);
  const logger = overrideLoggerPackage(api.logger);

  return {
    config,
    AuthStrategy: authStrategyFactory({ api, config, logger }),
  };
}

function deriveApi<R extends ShopifyRestResources = any>(
  appConfig: AppConfigArg
): Shopify<R> {
  const appUrl = new URL(appConfig.appUrl);
  const cleanApiConfig = {
    ...appConfig,
    hostName: appUrl.hostname,
    hostScheme: appUrl.protocol.replace(":", "") as "http" | "https",
  };

  return shopifyApi<R>(cleanApiConfig);
}

function deriveConfig<S extends SessionStorage = SessionStorage>(
  appConfig: AppConfigArg,
  apiConfig: ApiConfig
): AppConfig<S> {
  return {
    ...appConfig,
    ...apiConfig,
    sessionStorage: (appConfig.sessionStorage ??
      new MemorySessionStorage()) as unknown as S,
    auth: {
      path: appConfig.auth?.path ?? "/auth",
      callbackPath: appConfig.auth?.callbackPath ?? "/auth/callback",
      sessionTokenPath:
        appConfig.auth?.sessionTokenPath ?? "/auth/session-token",
    },
  };
}

// TODO This has been copied from shopify-app-express, it should be extracted into a shared package

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
