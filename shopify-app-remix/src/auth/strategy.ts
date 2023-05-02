import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import { SessionStorage, redirect } from "@remix-run/server-runtime";
import {
  CookieNotFound,
  InvalidOAuthError,
  Session,
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
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }

    const url = new URL(request.url);

    const isBouncePage = url.pathname.startsWith(config.auth.sessionTokenPath);
    const isExitIframe = url.pathname.startsWith(config.auth.exitIframePath);
    const headerSessionToken = request?.headers
      ?.get("authorization")
      ?.replace("Bearer ", "");
    const isAuthRequest = url.pathname.startsWith(config.auth.path);
    const isAuthCallbackRequest = url.pathname.startsWith(
      config.auth.callbackPath
    );

    logger.info("Authenticating request");

    let session: Session | undefined;
    if (isBouncePage) {
      logger.debug("Rendering bounce page");
      this.renderAppBridge();
    } else if (isExitIframe) {
      logger.debug("Rendering exit iframe page");
      this.renderAppBridge();
    } else if (isAuthCallbackRequest) {
      await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      await this.handleAuthBeginRequest(request);
    } else if (headerSessionToken) {
      session = await this.validateAuthenticatedSession(
        request,
        headerSessionToken
      );
    } else {
      session = await this.ensureInstalledOnShop(request);
    }

    return { session };

    // TODO Override client functions to return context for the request?
  }

  private async handleAuthBeginRequest(request: Request): Promise<void> {
    const { logger, api } = this.strategyClass();
    const url = new URL(request.url);

    logger.info("Handling OAuth begin request");

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    logger.debug("OAuth request contained valid shop", { shop });
    await this.beginAuth(request, false, shop);
  }

  private async handleAuthCallbackRequest(request: Request): Promise<void> {
    const { logger, config, api } = this.strategyClass();
    const url = new URL(request.url);

    logger.info("Handling OAuth callback request");

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    try {
      const { session, headers: responseHeaders } = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info("Requesting online access token for offline session");
        await this.beginAuth(request, true, shop);
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

  private async ensureInstalledOnShop(
    request: Request
  ): Promise<Session | undefined> {
    const { api, config, logger } = this.strategyClass();
    const url = new URL(request.url);

    // TODO Validate the HMAC signature on the request

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!);
    if (!host) {
      throw new Error("Host param is not present");
    }

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    logger.debug("Ensuring app is installed on shop", { shop });

    const searchParamSessionToken = url.searchParams.get("session_token");

    const offlineSession = await config.sessionStorage.loadSession(
      api.session.getOfflineId(shop)
    );

    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (url.searchParams.get("embedded") === "1") {
        this.redirectWithExitIframe(request, shop);
      } else {
        this.beginAuth(request, false, shop);
      }
    }

    let session: Session | undefined;
    if (api.config.isEmbeddedApp) {
      if (url.searchParams.get("embedded") !== "1") {
        logger.debug("App is not embedded, redirecting to Shopify", { shop });
        await this.redirectToShopifyOrAppRoot(request);
      } else if (searchParamSessionToken) {
        logger.debug(
          "Session token is present in query params, validating session",
          { shop }
        );
        session = await this.validateAuthenticatedSession(
          request,
          searchParamSessionToken
        );
      } else {
        logger.debug(
          "Missing session token in search params, going to bounce page",
          { shop }
        );
        this.redirectToBouncePage(url);
      }
    }

    return session;
  }

  private async validateAuthenticatedSession(
    request: Request,
    token: string
  ): Promise<Session | undefined> {
    const { api, config, logger } = this.strategyClass();

    logger.debug("Validating session token");

    // TODO update the API library to be able to find either a header or search param token for validation
    let shop: string;
    let userId: string;
    try {
      const payload = await api.session.decodeSessionToken(token);
      const dest = new URL(payload.dest);

      userId = payload.sub;
      shop = dest.hostname;
      logger.debug("Session token is valid", { shop, userId });
    } catch (error) {
      logger.debug(`Failed to validate session token: ${error.message}`);
      throw new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    const sessionId = config.useOnlineTokens
      ? this.getJwtSessionId(shop, userId)
      : this.getOfflineId(shop);
    if (!sessionId) {
      throw new Error("Session ID not found in JWT token");
    }
    logger.debug("Loading session from storage", { sessionId });

    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      const url = new URL(request.url);
      const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
      const isXhrRequest = request.headers.get("authorization");

      logger.debug("No session found, redirecting to OAuth", {
        shop,
        isEmbeddedRequest,
        isXhrRequest,
      });

      if (isEmbeddedRequest) {
        this.redirectWithExitIframe(request, shop);
      } else if (isXhrRequest) {
        this.respondWithAppBridgeRedirectHeaders(shop);
      } else {
        await this.beginAuth(request, false, shop);
      }
    }

    logger.debug("Found session, request is valid", { shop });

    return session;
  }

  // TODO export these methods out of the API library
  private getJwtSessionId(shop: string, userId: string): string {
    const { api } = this.strategyClass();
    return `${api.utils.sanitizeShop(shop, true)}_${userId}`;
  }

  // TODO export these methods out of the API library
  private getOfflineId(shop: string): string {
    const { api } = this.strategyClass();
    return `offline_${api.utils.sanitizeShop(shop, true)}`;
  }

  private async redirectToShopifyOrAppRoot(
    request: Request,
    responseHeaders?: Headers
  ): Promise<void> {
    const { api } = this.strategyClass();
    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!)!;
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!)!;

    const redirectUrl = api.config.isEmbeddedApp
      ? await api.auth.getEmbeddedAppUrl({ rawRequest: request })
      : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

    const headers: { [key: string]: string } = {};
    responseHeaders?.forEach(([key, value]) => (headers[key] = value));

    throw redirect(redirectUrl, {
      headers: {
        ...headers,
        location: redirectUrl,
      },
    });
  }

  private redirectWithExitIframe(request: Request, shop: string): void {
    const { api, config } = this.strategyClass();
    const url = new URL(request.url);

    const queryParams = url.searchParams;
    queryParams.set("shop", shop);
    queryParams.set("host", api.utils.sanitizeHost(queryParams.get("host")!)!);
    queryParams.set("exitIframe", `${config.auth.path}?shop=${shop}`);

    throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
  }

  private respondWithAppBridgeRedirectHeaders(shop: string): void {
    const { config } = this.strategyClass();
    const redirectUri = `${config.auth.path}?shop=${shop}`;

    // TODO verify that this is correct
    throw new Response(undefined, {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "X-Shopify-API-Request-Failure-Reauthorize": "1",
        "X-Shopify-API-Request-Failure-Reauthorize-Url": redirectUri,
      },
    });
  }

  private async beginAuth(
    request: Request,
    isOnline: boolean,
    shop: string
  ): Promise<void> {
    const { api, config } = this.strategyClass();

    throw await api.auth.begin({
      shop,
      callbackPath: config.auth.callbackPath,
      isOnline,
      rawRequest: request,
    });
  }

  private redirectToBouncePage(
    url: URL,
    redirectTo: string | undefined = undefined
  ): void {
    const params = new URLSearchParams(url.search);
    params.set("redirectTo", redirectTo ?? url.href);

    throw redirect(`/auth/session-token?${params.toString()}`);
  }

  private renderAppBridge(): void {
    const { config } = this.strategyClass();

    // TODO Align with ABN team on how to pass the URL in. Do we need to pass in the shop / host?
    throw new Response(
      `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`,
      { headers: { "content-type": "text/html;charset=utf-8" } }
    );
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
