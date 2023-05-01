import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import { SessionStorage } from "@remix-run/server-runtime";
import {
  CookieNotFound,
  InvalidOAuthError,
  Shopify,
} from "@shopify/shopify-api";
import isbot from "isbot";

import { BasicParams } from "../types.js";
import { AppConfig } from "../config-types.js";

interface AuthStrategyOptions extends BasicParams {}

// TODO Figure out what these types should be
export class AuthStrategyInternal extends Strategy<any, any> {
  name = "ShopifyAppAuthStrategy";

  protected static api: Shopify;
  protected static config: AppConfig;
  protected static logger: Shopify["logger"];

  constructor() {
    super(verifyAuth);
  }

  public async authenticate(
    request: Request,
    _sessionStorage: SessionStorage,
    _options: AuthenticateOptions
  ): Promise<any> {
    const { logger, config } = this.strategyClass();

    if (isbot(request.headers.get("User-Agent"))) {
      logger.debug("Request is from a bot, skipping auth");
      throw new Response(null, { status: 400 });
    }

    const url = new URL(request.url);
    url.protocol = "https:";

    const isBouncePage = url.pathname.startsWith(config.auth.sessionTokenPath);
    const hasSessionTokenInHeaders = request?.headers?.get(
      "x-shopify-session-token"
    );
    const isAuthRequest = url.pathname.startsWith(config.auth.path);
    const isAuthCallbackRequest = url.pathname.startsWith(
      config.auth.callbackPath
    );

    if (isBouncePage) {
      throw new Response(
        `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`,
        { headers: { "content-type": "text/html;charset=utf-8" } }
      );
    }

    if (isAuthCallbackRequest) {
      await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      await this.handleAuthBeginRequest(request);
    } else if (hasSessionTokenInHeaders) {
      // return await this.verifySessionToken(request, sessionStorage, options);
    } else {
      // const storeFQDN = url.searchParams.get("shop") as string;
      // if (!storeFQDN) {
      //   throw new Error("Shop param is not present");
      // }
      // const storeToken = storeFQDN
      //   ? await this.options.tokenStorage.getToken(storeFQDN)
      //   : null;
      // if (storeToken) {
      //   return await this.redirectToBouncePage(url);
      // } else {
      //   return await this.redirectToAuth(request, sessionStorage, options);
      // }
    }
  }

  private async handleAuthBeginRequest(request: Request): Promise<void> {
    const { logger, config, api } = this.strategyClass();

    const url = new URL(request.url);

    logger.info("Handling OAuth begin request");

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    logger.debug("OAuth request contained valid shop", { shop });

    throw await api.auth.begin({
      shop,
      callbackPath: config.auth.callbackPath,
      isOnline: false,
      rawRequest: request,
    });
  }

  private async handleAuthCallbackRequest(request: Request): Promise<void> {
    const { logger, config, api } = this.strategyClass();

    const url = new URL(request.url);

    logger.info("Handling OAuth callback request");

    try {
      const { session, headers: responseHeaders } = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info("Requesting online access token for offline session");

        throw await api.auth.begin({
          shop: api.utils.sanitizeShop(url.searchParams.get("shop")!)!,
          callbackPath: config.auth.callbackPath,
          isOnline: true,
          rawRequest: request,
        });
      }

      // TODO register webhooks here

      await this.redirectToShopifyOrAppRoot(request, responseHeaders);
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }

      logger.error("Error during OAuth callback", { error: error.message });

      switch (true) {
        case error instanceof InvalidOAuthError:
          throw new Response(undefined, {
            status: 400,
            statusText: "Invalid OAuth Request",
          });
        case error instanceof CookieNotFound:
          await this.handleAuthBeginRequest(request);
          break;
        default:
          throw new Response(undefined, {
            status: 500,
            statusText: "Internal Server Error",
          });
      }
    }
  }

  private async redirectToShopifyOrAppRoot(
    request: Request,
    responseHeaders: Headers
  ): Promise<void> {
    const { api } = this.strategyClass();

    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!)!;
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!)!;

    const redirectUrl = api.config.isEmbeddedApp
      ? await api.auth.getEmbeddedAppUrl({ rawRequest: request })
      : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

    const headers: { [key: string]: string } = {};
    responseHeaders.forEach(([key, value]) => (headers[key] = value));

    throw new Response(undefined, {
      status: 302,
      headers: {
        ...headers,
        location: redirectUrl,
      },
    });
  }

  private strategyClass() {
    return this.constructor as typeof AuthStrategyInternal;
  }
}

// TODO figure out the User type here
// TODO look at the docs and implement this
const verifyAuth: StrategyVerifyCallback<any, {}> = async (_params: {}) => {};

export function authStrategyFactory(
  params: AuthStrategyOptions
): typeof AuthStrategyInternal {
  const { api, config, logger } = params;

  class AuthStrategy extends AuthStrategyInternal {
    protected static api = api;
    protected static config = config;
    protected static logger = logger;

    constructor() {
      super();
    }
  }

  Reflect.defineProperty(AuthStrategy, "name", {
    value: "AuthStrategyInternal",
  });

  return AuthStrategy as typeof AuthStrategyInternal;
}
