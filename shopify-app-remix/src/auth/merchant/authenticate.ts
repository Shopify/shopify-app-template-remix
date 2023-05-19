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

import { BasicParams } from "../../types";
import { AdminContext, AppConfig, AppConfigArg } from "../../config-types";
import { BillingContext } from "../../billing/types";
import { requestBillingFactory, requireBillingFactory } from "../../billing";

import { MerchantContext } from "./types";
import {
  beginAuth,
  getSessionTokenHeader,
  redirectWithExitIframe,
  redirectToAuthPage,
  validateSessionToken,
  rejectBotRequest,
} from "../helpers";

interface SessionContext {
  session: Session;
  token?: JwtPayload;
}

const SESSION_TOKEN_PARAM = "id_token";

export class AuthStrategy<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> {
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify["logger"];

  public constructor({ api, config, logger }: BasicParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async authenticateMerchant(
    request: Request
  ): Promise<MerchantContext<Config, Resources>> {
    const { api, logger, config } = this;

    rejectBotRequest({ api, logger, config }, request);

    const url = new URL(request.url);

    const isBouncePage = url.pathname === config.auth.sessionTokenPath;
    const isExitIframe = url.pathname === config.auth.exitIframePath;
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;
    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info("Authenticating merchant request");

    let sessionContext: SessionContext;
    if (isBouncePage) {
      logger.debug("Rendering bounce page");
      this.renderAppBridge();
    } else if (isExitIframe) {
      logger.debug("Rendering exit iframe page");
      this.renderAppBridge(url.searchParams.get("exitIframe")!);
    } else if (isAuthCallbackRequest) {
      throw await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      throw await this.handleAuthBeginRequest(request);
    } else if (sessionTokenHeader) {
      const sessionToken = await validateSessionToken(
        { api, logger, config },
        sessionTokenHeader
      );

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

    const context = {
      admin: this.createAdminContext(request, sessionContext.session),
      billing: this.createBillingContext(request, sessionContext.session),
      session: sessionContext.session,
    };

    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken: sessionContext!.token!,
      } as MerchantContext<Config, Resources>;
    } else {
      return context as MerchantContext<Config, Resources>;
    }
  }

  private async handleAuthBeginRequest(request: Request): Promise<never> {
    const { api, config, logger } = this;
    const url = new URL(request.url);

    logger.info("Handling OAuth begin request");

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Error("Shop param is not present");
    }

    logger.debug("OAuth request contained valid shop", { shop });
    throw await beginAuth({ api, config, logger }, request, false, shop);
  }

  private async handleAuthCallbackRequest(request: Request): Promise<never> {
    const { api, config, logger } = this;
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
        await beginAuth({ api, config, logger }, request, true, shop);
      }

      if (config.hooks.afterAuth) {
        logger.info("Running afterAuth hook");
        await config.hooks.afterAuth({
          session,
          admin: this.createAdminContext(request, session),
        });
      }

      throw await this.redirectToShopifyOrAppRoot(request, responseHeaders);
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
          throw await this.handleAuthBeginRequest(request);
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
    const { api } = this;
    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!);
    if (!host) {
      throw new Error("Host param is not present");
    }

    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);

    if (!shop) {
      throw new Error("Shop param is not present");
    }
  }

  private async ensureInstalledOnShop(request: Request) {
    const { api, config, logger } = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;

    // Ensure app is installed
    logger.debug("Ensuring app is installed on shop", { shop });

    const offlineSession = await config.sessionStorage.loadSession(
      api.session.getOfflineId(shop)
    );

    // TODO We need to implement an app/uninstalled webhook handler to delete sessions for the shop
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28375165
    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (url.searchParams.get("embedded") === "1") {
        redirectWithExitIframe({ api, config, logger }, request, shop);
      } else {
        await beginAuth({ api, config, logger }, request, false, shop);
      }
    }
  }

  private async ensureAppIsEmbeddedIfRequired(request: Request) {
    const { api, logger } = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;

    if (api.config.isEmbeddedApp && url.searchParams.get("embedded") !== "1") {
      logger.debug("App is not embedded, redirecting to Shopify", { shop });
      await this.redirectToShopifyOrAppRoot(request);
    }
  }

  private async ensureSessionTokenSearchParamIfRequired(request: Request) {
    const { api, logger } = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);

    if (api.config.isEmbeddedApp && !searchParamSessionToken) {
      logger.debug(
        "Missing session token in search params, going to bounce page",
        { shop }
      );
      this.redirectToBouncePage(url);
    }
  }

  private async ensureSessionExists(request: Request): Promise<SessionContext> {
    const { api, config, logger } = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM)!;

    if (api.config.isEmbeddedApp) {
      logger.debug(
        "Session token is present in query params, validating session",
        { shop }
      );

      const sessionToken = await validateSessionToken(
        { api, config, logger },
        searchParamSessionToken
      );

      return this.validateAuthenticatedSession(request, sessionToken);
    } else {
      // TODO move this check into loadSession once we add support for it in the library
      // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378114
      const sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
      if (!sessionId) {
        throw new Error("Session ID not found in cookies");
      }

      return { session: await this.loadSession(request, shop, sessionId) };
    }
  }

  private async validateAuthenticatedSession(
    request: Request,
    payload: JwtPayload
  ): Promise<SessionContext> {
    const { config, logger, api } = this;

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, payload.sub)
      : api.session.getOfflineId(shop);

    if (!sessionId) {
      throw new Error("Session ID not found in JWT token");
    }

    const session = await this.loadSession(request, shop, sessionId);

    logger.debug("Found session, request is valid", { shop });

    return { session, token: payload };
  }

  private async loadSession(
    request: Request,
    shop: string,
    sessionId: string
  ): Promise<Session> {
    const { api, config, logger } = this;

    logger.debug("Loading session from storage", { sessionId });

    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.debug("No session found, redirecting to OAuth", { shop });
      await redirectToAuthPage({ api, config, logger }, request, shop);
    } else if (!session.isActive(config.scopes)) {
      logger.debug(
        "Found a session, but it has expired, redirecting to OAuth",
        { shop }
      );
      await redirectToAuthPage({ api, config, logger }, request, shop);
    }

    return session!;
  }

  private async redirectToShopifyOrAppRoot(
    request: Request,
    responseHeaders?: Headers
    // TODO: We should return `never` when we're throwing responses
  ): Promise<never> {
    const { api } = this;
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

  private redirectToBouncePage(url: URL): void {
    const { api, config } = this;

    // TODO this is to work around a remix bug
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    url.protocol = `${api.config.hostScheme}:`;

    const params = new URLSearchParams(url.search);
    params.set("shopify-reload", url.href);

    // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    throw redirect(`${config.auth.sessionTokenPath}?${params.toString()}`);
  }

  private renderAppBridge(redirectTo?: string): never {
    const { config } = this;

    let redirectToScript = "";
    if (redirectTo) {
      const redirectUrl = decodeURIComponent(
        redirectTo.startsWith("/")
          ? `${config.appUrl}${redirectTo}`
          : redirectTo
      );

      redirectToScript = `<script>shopify.redirectTo("${redirectUrl}")</script>`;
    }

    throw new Response(
      `
        <script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>
        ${redirectToScript}
      `,
      { headers: { "content-type": "text/html;charset=utf-8" } }
    );
  }

  private overriddenRestClient(request: Request, session: Session) {
    const { api, config, logger } = this;

    // TODO Evaluate memory and time costs for this
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376875
    const client = new api.clients.Rest({ session });
    const originalRequest = Reflect.get(client, "request");

    Reflect.set(client, "request", async (params: RequestParams) => {
      try {
        return await originalRequest.call(client, params);
      } catch (error) {
        if (error instanceof HttpResponseError && error.response.code === 401) {
          await redirectToAuthPage(
            { api, config, logger },
            request,
            session.shop
          );
        } else {
          throw error;
        }
      }
    });

    // TODO This is not thread safe and will fail. Can we return this in a thread safe way without duplicating the resources?
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376875
    Object.entries(api.rest).forEach(([name, resource]) => {
      resource.client = client;
      Reflect.set(client, name, resource);
    });

    return client as typeof client & Resources;
  }

  private overriddenGraphqlClient(request: Request, session: Session) {
    const { api, config } = this;

    const client = new api.clients.Graphql({ session });
    const originalQuery = Reflect.get(client, "query");

    Reflect.set(client, "query", async (params: RequestParams) => {
      try {
        return await originalQuery.call(client, params);
      } catch (error) {
        if (error instanceof HttpResponseError && error.response.code === 401) {
          await redirectToAuthPage(
            { api, config, logger: this.logger },
            request,
            session.shop
          );
        } else {
          throw error;
        }
      }
    });

    return client;
  }

  private createBillingContext(
    request: Request,
    session: Session
  ): BillingContext<Config> {
    const { api, logger, config } = this;

    return {
      require: requireBillingFactory({ api, logger, config }, session),
      request: requestBillingFactory({ api, logger, config }, request, session),
    };
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
}
