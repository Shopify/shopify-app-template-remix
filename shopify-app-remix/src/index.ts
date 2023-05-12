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
import { webhookStrategyFactory } from "./webhooks/strategy";
import {
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
  OAuthContext,
  SessionContextType,
} from "./auth/types";
import { BasicParams, ShopifyApp } from "./types";
import { registerWebhooksFactory } from "./webhooks";
import { Authenticator } from "remix-auth";
import { WebhookContext } from "./webhooks/types";

export { ShopifyApp } from "./types";

export function shopifyApp<
  Config extends AppConfigArg<Resources, Storage>,
  Resources extends ShopifyRestResources = any,
  Storage extends SessionStorage = SessionStorage
>(
  appConfig: Config
): ShopifyApp<
  SessionContextType<Config>,
  Storage,
  AppConfig<Storage>,
  Config["restResources"] extends Resources
    ? Config["restResources"]
    : Resources
> {
  const api = deriveApi<Resources>(appConfig);
  const config = deriveConfig<Storage>(appConfig, api.config);
  const logger = overrideLoggerPackage(api.logger);

  if (appConfig.webhooks) {
    // TODO The any is a temporary workaround until the library supports the new webhook format
    api.webhooks.addHandlers(appConfig.webhooks as any);
  }

  // TODO: Should we be returning the api object as part of this response? How can apps get session ids otherwise?
  return {
    config,
    registerWebhooks: registerWebhooksFactory({ api, config, logger }),
    authenticate: {
      oauth: oAuthAuthenticatorFactory<SessionContextType<Config>, Resources>({
        api,
        config,
        logger,
      }),
      webhook: webhookAuthenticatorFactory<Resources>({ api, config, logger }),
    },
  };
}

function deriveApi<Resources extends ShopifyRestResources = any>(
  appConfig: AppConfigArg
): Shopify<Resources> {
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

  return shopifyApi<Resources>(cleanApiConfig);
}

function deriveConfig<Storage extends SessionStorage = SessionStorage>(
  appConfig: AppConfigArg,
  apiConfig: ApiConfig
): AppConfig<Storage> {
  return {
    ...appConfig,
    ...apiConfig,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: (appConfig.sessionStorage ??
      new MemorySessionStorage()) as unknown as Storage,
    // TODO: Replace these settings with just a prefix, and "hardcode" the actual paths
    // E.g: User passes /auth, and we derive /auth/callback, /auth/session-token, etc
    auth: {
      path: appConfig.auth?.path || "/auth",
      callbackPath: appConfig.auth?.callbackPath || "/auth/callback",
      sessionTokenPath:
        appConfig.auth?.sessionTokenPath || "/auth/session-token",
      exitIframePath: appConfig.auth?.exitIframePath || "/auth/exit-iframe",
    },
  };
}

function oAuthAuthenticatorFactory<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = any
>(params: BasicParams) {
  const Strategy = authStrategyFactory<SessionContext, Resources>(params);

  const authenticator = new Authenticator<OAuthContext<SessionContext>>(
    {} as any
  );
  authenticator.use(new Strategy(), "shopify-app");

  return (request: Request) => {
    return authenticator.authenticate("shopify-app", request);
  };
}

function webhookAuthenticatorFactory<
  Resources extends ShopifyRestResources = any
>(params: BasicParams) {
  const Strategy = webhookStrategyFactory<Resources>(params);

  const authenticator = new Authenticator<WebhookContext<Resources>>({} as any);
  authenticator.use(new Strategy(), "shopify-webhook");

  return (request: Request) => {
    return authenticator.authenticate("shopify-webhook", request);
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
