import isbot from "isbot";
import { Strategy, StrategyVerifyCallback } from "remix-auth";
import { redirect } from "@remix-run/server-runtime";
import {
  CookieNotFound,
  HttpResponseError,
  InvalidOAuthError,
  JwtPayload,
  RequestParams,
  Session,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import { BasicParams } from "../types.js";
import { AdminContext, AppConfig } from "../config-types.js";

import {
  OAuthContext,
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
} from "./types.js";

export class AuthStrategyInternal<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = any
> extends Strategy<OAuthContext<SessionContext, Resources>, any> {
  name = "ShopifyAppAuthStrategy";

  protected static api: Shopify;
  protected static config: AppConfig;
  protected static logger: Shopify["logger"];

  constructor() {
    super(verifyAuth);
  }

  public async authenticate(
    request: Request
  ): Promise<OAuthContext<SessionContext, Resources>> {
    const { logger, config } = this.strategyClass();

    if (isbot(request.headers.get("User-Agent"))) {
      logger.debug("Request is from a bot, skipping auth");
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }

    const url = new URL(request.url);

    const isBouncePage = url.pathname.startsWith(config.auth.sessionTokenPath);
    const isExitIframe = url.pathname.startsWith(config.auth.exitIframePath);
    const sessionTokenHeader = request?.headers
      ?.get("authorization")
      ?.replace("Bearer ", "");
    const isAuthRequest = url.pathname.startsWith(config.auth.path);
    const isAuthCallbackRequest = url.pathname.startsWith(
      config.auth.callbackPath
    );

    logger.info("Authenticating request");

    let sessionContext: SessionContext;
    if (isBouncePage) {
      logger.debug("Rendering bounce page");
      this.renderAppBridge();
    } else if (isExitIframe) {
      logger.debug("Rendering exit iframe page");
      this.renderAppBridge(url.searchParams.get("exitIframe")!);
    } else if (isAuthCallbackRequest) {
      await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      await this.handleAuthBeginRequest(request);
    } else if (sessionTokenHeader) {
      const sessionToken = await this.validateSessionToken(sessionTokenHeader);

      sessionContext = await this.validateAuthenticatedSession(
        request,
        sessionToken
      );
    } else {
      await this.validateUrlParams(request);
      await this.ensureInstalledOnShop(request);
      await this.ensureAppIsEmbeddedIfRequired(request);
      await this.ensureSessionTokenSearchParamIfRequired(request);

      sessionContext = await this.ensureSessionExists(request);
    }

    return {
      admin: this.createAdminContext(request, sessionContext!.session),
      session: sessionContext!,
    };
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

      if (config.hooks.afterAuth) {
        logger.info("Running afterAuth hook");
        await config.hooks.afterAuth({
          session,
          admin: this.createAdminContext(request, session),
        });
      }

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

  private async validateUrlParams(request: Request) {
    const { api } = this.strategyClass();
    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!);
    if (!host) {
      throw new Error("Host param is not present");
    }

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    // TODO: Start validating HMAC if CLI can produce valid links
    // const isValidHmac = await api.utils.validateHmac(
    //   Object.fromEntries(url.searchParams.entries())
    // );
    // if (!isValidHmac) {
    //   throw new Error("Request does not have a valid HMAC signature");
    // }
  }

  private async ensureInstalledOnShop(request: Request) {
    const { api, config, logger } = this.strategyClass();
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;

    // Ensure app is installed
    logger.debug("Ensuring app is installed on shop", { shop });

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
        await this.beginAuth(request, false, shop);
      }
    }
  }

  private async ensureAppIsEmbeddedIfRequired(request: Request) {
    const { api, logger } = this.strategyClass();
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;

    if (api.config.isEmbeddedApp && url.searchParams.get("embedded") !== "1") {
      logger.debug("App is not embedded, redirecting to Shopify", { shop });
      await this.redirectToShopifyOrAppRoot(request);
    }
  }

  private async ensureSessionTokenSearchParamIfRequired(request: Request) {
    const { api, logger } = this.strategyClass();
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;
    const searchParamSessionToken = url.searchParams.get("session_token");

    if (api.config.isEmbeddedApp && !searchParamSessionToken) {
      logger.debug(
        "Missing session token in search params, going to bounce page",
        { shop }
      );
      this.redirectToBouncePage(url);
    }
  }

  private async ensureSessionExists(request: Request): Promise<SessionContext> {
    const { api, config, logger } = this.strategyClass();
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;
    const searchParamSessionToken = url.searchParams.get("session_token")!;

    if (api.config.isEmbeddedApp) {
      logger.debug(
        "Session token is present in query params, validating session",
        { shop }
      );

      const sessionToken = await this.validateSessionToken(
        searchParamSessionToken
      );

      return this.validateAuthenticatedSession(request, sessionToken);
    } else {
      // TODO move this check into loadSession once we add support for it in the library
      const sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
      if (!sessionId) {
        throw new Error("Session ID not found in cookies");
      }

      return {
        session: await this.loadSession(request, shop, sessionId),
      } as SessionContext;
    }
  }

  private async validateSessionToken(token: string): Promise<JwtPayload> {
    const { api, logger } = this.strategyClass();

    logger.debug("Validating session token");

    // TODO update the API library to be able to find either a header or search param token for validation
    try {
      const payload = await api.session.decodeSessionToken(token);
      logger.debug("Session token is valid", {
        payload: JSON.stringify(payload),
      });

      return payload;
    } catch (error) {
      logger.debug(`Failed to validate session token: ${error.message}`);
      throw new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      });
    }
  }

  private async validateAuthenticatedSession(
    request: Request,
    payload: JwtPayload
  ): Promise<SessionContext> {
    const { config, logger } = this.strategyClass();

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    const sessionId = config.useOnlineTokens
      ? this.getJwtSessionId(shop, payload.sub)
      : this.getOfflineId(shop);
    if (!sessionId) {
      throw new Error("Session ID not found in JWT token");
    }

    const session = await this.loadSession(request, shop, sessionId);

    logger.debug("Found session, request is valid", { shop });

    return { session, token: payload } as SessionContext;
  }

  private async loadSession(
    request: Request,
    shop: string,
    sessionId: string
  ): Promise<Session> {
    const { config, logger } = this.strategyClass();

    logger.debug("Loading session from storage", { sessionId });

    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.debug("No session found, redirecting to OAuth", { shop });
      await this.renderAuthPage(request, shop);
    }

    return session!;
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
    const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

    throw new Response(undefined, {
      status: 401,
      statusText: "Unauthorized",
      headers: { "X-Shopify-API-Request-Failure-Reauthorize-Url": redirectUri },
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

  private redirectToBouncePage(url: URL): void {
    const { api, config } = this.strategyClass();

    // TODO this is to work around a remix bug
    url.protocol = `${api.config.hostScheme}:`;

    const params = new URLSearchParams(url.search);
    params.set("shopify-reload", url.href);

    // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
    throw redirect(`${config.auth.sessionTokenPath}?${params.toString()}`);
  }

  private renderAppBridge(redirectTo?: string): void {
    const { config } = this.strategyClass();

    const redirectToScript = redirectTo
      ? `<script>shopify.redirectTo("${config.appUrl}${redirectTo}")</script>`
      : ``;

    throw new Response(
      `
        <script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>
        ${redirectToScript}
      `,
      { headers: { "content-type": "text/html;charset=utf-8" } }
    );
  }

  private async renderAuthPage(request: Request, shop: string): Promise<void> {
    const url = new URL(request.url);
    const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
    const isXhrRequest = request.headers.get("authorization");

    if (isXhrRequest) {
      this.respondWithAppBridgeRedirectHeaders(shop);
    } else if (isEmbeddedRequest) {
      this.redirectWithExitIframe(request, shop);
    } else {
      await this.beginAuth(request, false, shop);
    }
  }

  private overriddenRestClient(request: Request, session: Session) {
    const { api } = this.strategyClass();

    // TODO Evaluate memory and time costs for this
    const client = new api.clients.Rest({ session });
    const originalRequest = Reflect.get(client, "request");

    Reflect.set(client, "request", async (params: RequestParams) => {
      try {
        return await originalRequest.call(client, params);
      } catch (error) {
        if (error instanceof HttpResponseError && error.response.code === 401) {
          await this.renderAuthPage(request, session.shop);
        } else {
          throw error;
        }
      }
    });

    // TODO This is not thread safe and will fail. Can we return this in a thread safe way without duplicating the resources?
    Object.entries(api.rest).forEach(([name, resource]) => {
      resource.client = client;
      Reflect.set(client, name, resource);
    });

    return client as typeof client & Resources;
  }

  private overriddenGraphqlClient(request: Request, session: Session) {
    const { api } = this.strategyClass();

    const client = new api.clients.Graphql({ session });
    const originalQuery = Reflect.get(client, "query");

    Reflect.set(client, "query", async (params: RequestParams) => {
      try {
        return await originalQuery.call(client, params);
      } catch (error) {
        if (error instanceof HttpResponseError && error.response.code === 401) {
          await this.renderAuthPage(request, session.shop);
        } else {
          throw error;
        }
      }
    });

    return client;
  }

  private createAdminContext(
    request: Request,
    session: Session
  ): AdminContext<Resources> {
    return {
      rest: this.overriddenRestClient(request, session),
      graphql: this.overriddenGraphqlClient(request, session),
    };
  }

  private strategyClass() {
    return this.constructor as typeof AuthStrategyInternal;
  }
}

// TODO figure out the User type here
// TODO look at the docs and implement this
const verifyAuth: StrategyVerifyCallback<any, {}> = async (_params: {}) => {};

export function authStrategyFactory<
  T extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  R extends ShopifyRestResources = any
>(params: BasicParams): typeof AuthStrategyInternal<T, R> {
  const { api, config, logger } = params;

  class AuthStrategy extends AuthStrategyInternal<T, R> {
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
