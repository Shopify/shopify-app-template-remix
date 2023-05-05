import semver from "semver";
import "./shopify-api-adapter";
import {
  Shopify as ShopifyApi,
  ConfigInterface as ApiConfig,
  ConfigParams,
  FeatureDeprecatedError,
  Shopify,
  ShopifyRestResources,
  shopifyApi,
  HttpResponseError,
  RestRequestReturn,
  RequestParams,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { AppConfig, AppConfigArg } from "./config-types.js";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "./version.js";
import { AuthStrategyInternal, authStrategyFactory } from "./auth/index.js";
import {
  SessionContextType,
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
} from "./auth/types";

export { Context } from "./auth/types";

export interface ShopifyApp<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Storage extends SessionStorage = SessionStorage,
  Config extends AppConfig<Storage> = AppConfig<Storage>
> {
  config: Config;
  AuthStrategy: typeof AuthStrategyInternal<SessionContext>;
}

export function shopifyApp<
  T extends AppConfigArg<R, S>,
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
>(appConfig: T): ShopifyApp<SessionContextType<T>, S> {
  const originalApi = deriveApi<R>(appConfig);
  const config = deriveConfig<S>(appConfig, originalApi.config);
  const logger = overrideLoggerPackage(originalApi.logger);

  const api = overrideHttpClients(originalApi, config);

  return {
    config,
    AuthStrategy: authStrategyFactory<SessionContextType<T>>({
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

// TODO centralize the code for responding with the reauthorize header
function overrideHttpClients(api: ShopifyApi, config: AppConfig): ShopifyApi {
  // @ts-ignore
  const originalRequest = api.clients.Rest.prototype.request;

  // prettier-ignore
  class RemixRestClient extends (api.clients.Rest) {
    async request<T = any>(params: RequestParams): Promise<RestRequestReturn<T>> {
      try {
        return await originalRequest.call(this, params);
      } catch (error) {
        if (error instanceof HttpResponseError && error.response.code === 401) {
          // TODO There seems to be a Remix bug here that prevents the headers from being returned to the browser
          // TODO We need access to the request object here to be able to determine whether this is an app bridge, exit iframe or redirect request
          throw new Response(undefined, {
            status: 401,
            statusText: "Unauthorized",
            headers: {
              "Location": `${config.auth.path}?shop=${this.session.shop}`,
              "X-Shopify-API-Request-Failure-Reauthorize": "1",
              "X-Shopify-API-Request-Failure-Reauthorize-Url": `${config.auth.path}?shop=${this.session.shop}`,
            },
          });
        } else {
          throw error;
        }
      }
    }
  }

  api.clients.Rest = RemixRestClient;
  return api;
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
