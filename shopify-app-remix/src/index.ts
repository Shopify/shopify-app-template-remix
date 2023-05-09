import semver from "semver";
import "./shopify-api-adapter";
import {
  ConfigInterface as ApiConfig,
  ConfigParams,
  FeatureDeprecatedError,
  Shopify,
  ShopifyRestResources,
  shopifyApi,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { AppConfig, AppConfigArg } from "./config-types.js";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "./version.js";
import { authStrategyFactory } from "./auth/index.js";
import { SessionContextType } from "./auth/types";
import { ShopifyApp } from "./types";

export { ShopifyApp } from "./types";
export { Context } from "./auth/types";

export function shopifyApp<
  T extends AppConfigArg<R, S>,
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
>(appConfig: T): ShopifyApp<SessionContextType<T>, S> {
  const api = deriveApi<R>(appConfig);
  const config = deriveConfig<S>(appConfig, api.config);
  const logger = overrideLoggerPackage(api.logger);

  return {
    config,
    AuthStrategy: authStrategyFactory<SessionContextType<T>, R>({
      api,
      config,
      logger,
    }),
  };
}

function deriveApi<R extends ShopifyRestResources = any>(
  appConfig: AppConfigArg
): Shopify<R> {
  // TODO make sure the port is being added in the CLI when filling SHOPIFY_APP_URL
  const appUrl = new URL(appConfig.appUrl);

  let userAgentPrefix = `Shopify Remix Library v${SHOPIFY_REMIX_LIBRARY_VERSION}`;
  if (appConfig.userAgentPrefix) {
    userAgentPrefix = `${appConfig.userAgentPrefix} | ${userAgentPrefix}`;
  }

  const cleanApiConfig: ConfigParams = {
    ...appConfig,
    hostName: appUrl.host,
    hostScheme: appUrl.protocol.replace(":", "") as "http" | "https",
    userAgentPrefix,
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
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    sessionStorage: (appConfig.sessionStorage ??
      new MemorySessionStorage()) as unknown as S,
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
