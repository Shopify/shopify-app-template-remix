import { redirect } from "@remix-run/server-runtime";
import {
  CookieNotFound,
  GraphqlQueryError,
  HttpResponseError,
  InvalidHmacError,
  InvalidOAuthError,
  JwtPayload,
  RequestParams,
  Session,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import { BasicParams } from "../../types";
import { AdminApiContext, AppConfig, AppConfigArg } from "../../config-types";
import { BillingContext } from "../../billing/types";
import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from "../../billing";
import { addResponseHeaders } from "../helpers/add-response-headers";
import {
  beginAuth,
  getSessionTokenHeader,
  redirectWithExitIframe,
  redirectToAuthPage,
  validateSessionToken,
  rejectBotRequest,
} from "../helpers";

import { graphqlClientFactory } from "./graphql-client";
import { AdminContext } from "./types";

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

  public async authenticateAdmin(
    request: Request
  ): Promise<AdminContext<Config, Resources>> {
    const { api, logger, config } = this;

    rejectBotRequest({ api, logger, config }, request);
    this.respondToOptionsRequest(request);

    let sessionContext: SessionContext;
    try {
      sessionContext = await this.authenticateAndGetSessionContext(request);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        this.ensureResponseHeaders(request, errorOrResponse);
      }

      throw errorOrResponse;
    }

    const context = {
      admin: this.createAdminApiContext(request, sessionContext.session),
      billing: this.createBillingContext(request, sessionContext.session),
      session: sessionContext.session,
    };

    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken: sessionContext!.token!,
      } as AdminContext<Config, Resources>;
    } else {
      return context as AdminContext<Config, Resources>;
    }
  }

  private async authenticateAndGetSessionContext(request: Request): Promise<SessionContext> {
    const { api, logger, config } = this;

    const url = new URL(request.url);

    const isPatchSessionToken =
      url.pathname === config.auth.patchSessionTokenPath;
    const isExitIframe = url.pathname === config.auth.exitIframePath;
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;
    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info("Authenticating admin request");

    if (isPatchSessionToken) {
      logger.debug("Rendering bounce page");
      this.renderAppBridge();
    } else if (isExitIframe) {
      const destination = url.searchParams.get("exitIframe")!;

      logger.debug("Rendering exit iframe page", { destination });
      this.renderAppBridge(destination);
    } else if (isAuthCallbackRequest) {
      throw await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      throw await this.handleAuthBeginRequest(request);
    } else if (sessionTokenHeader) {
      const sessionToken = await validateSessionToken(
        { api, logger, config },
        sessionTokenHeader
      );

      return await this.validateAuthenticatedSession(
        request,
        sessionToken
      );
    } else {
      await this.validateUrlParams(request);
      await this.ensureInstalledOnShop(request);
      await this.ensureAppIsEmbeddedIfRequired(request);
      await this.ensureSessionTokenSearchParamIfRequired(request);

      return await this.ensureSessionExists(request);
    }
  }

  private async handleAuthBeginRequest(request: Request): Promise<never> {
    const { api, config, logger } = this;

    logger.info("Handling OAuth begin request");

    const shop = this.ensureValidShopParam(request);

    logger.debug("OAuth request contained valid shop", { shop });
    throw await beginAuth({ api, config, logger }, request, false, shop);
  }

  private async handleAuthCallbackRequest(request: Request): Promise<never> {
    const { api, config, logger } = this;

    logger.info("Handling OAuth callback request");

    const shop = this.ensureValidShopParam(request);

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
          admin: this.createAdminApiContext(request, session),
        });
      }

      throw await this.redirectToShopifyOrAppRoot(request, responseHeaders);
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }

      logger.error("Error during OAuth callback", { error: error.message });

      if (error instanceof CookieNotFound) {
        throw await this.handleAuthBeginRequest(request);
      } else if (
        error instanceof InvalidHmacError ||
        error instanceof InvalidOAuthError
      ) {
        throw new Response(undefined, {
          status: 400,
          statusText: "Invalid OAuth Request",
        });
      } else {
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

    if (this.config.isEmbeddedApp) {
      const host = api.utils.sanitizeHost(url.searchParams.get("host")!);
      if (!host) {
        throw new Response(undefined, {
          status: 400,
          statusText: "Bad Request",
        });
      }
    }

    // There's an assumption here that the shop search param will always be present. If it isn't, we'll throw an error
    // but an alternative would be to show a page for the user to fill in the shop, like shopify_app does.
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);
    if (!shop) {
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }
  }

  private async ensureInstalledOnShop(request: Request) {
    const { api, config, logger } = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get("shop")!;
    const isEmbedded = url.searchParams.get("embedded") === "1";

    // Ensure app is installed
    logger.debug("Ensuring app is installed on shop", { shop });

    const offlineSession = await config.sessionStorage.loadSession(
      api.session.getOfflineId(shop)
    );

    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (isEmbedded) {
        redirectWithExitIframe({ api, config, logger }, request, shop);
      } else {
        throw await beginAuth({ api, config, logger }, request, false, shop);
      }
    }

    if (config.isEmbeddedApp && !isEmbedded) {
      try {
        logger.debug("Ensuring offline session is valid before embedding", {
          shop,
        });
        await this.testSession(offlineSession);

        logger.debug("Offline session is still valid, embedding app", { shop });
      } catch (error) {
        if (error instanceof HttpResponseError) {
          if (error.response.code === 401) {
            logger.info(
              "Shop session is no longer valid, redirecting to OAuth",
              { shop }
            );
            throw await beginAuth(
              { api, config, logger },
              request,
              false,
              shop
            );
          } else {
            const message = JSON.stringify(error.response.body, null, 2);
            logger.error(
              `Unexpected error during session validation: ${message}`,
              { shop }
            );

            throw new Response(undefined, {
              status: error.response.code,
              statusText: error.response.statusText,
            });
          }
        } else if (error instanceof GraphqlQueryError) {
          const context: Record<string, string> = { shop };
          if (error.response) {
            context.response = JSON.stringify(error.response);
          }

          logger.error(
            `Unexpected error during session validation: ${error.message}`,
            context
          );

          throw new Response(undefined, {
            status: 500,
            statusText: "Internal Server Error",
          });
        }
      }
    }
  }

  private async testSession(session: Session): Promise<void> {
    const { api } = this;

    const client = new api.clients.Graphql({
      session: session,
    });

    await client.query({
      data: `#graphql
        query {
          shop {
            name
          }
        }
      `,
    });
  }

  private ensureValidShopParam(request: Request): string {
    const url = new URL(request.url);
    const { api } = this;
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!);

    if (!shop) {
      throw new Response("Shop param is invalid", {
        status: 400,
      });
    }

    return shop;
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
        logger.debug("Session id not found in cookies, redirecting to OAuth", {
          shop,
        });
        throw await beginAuth({ api, config, logger }, request, false, shop);
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
  ): Promise<never> {
    const { api } = this;
    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get("host")!)!;
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop")!)!;

    const redirectUrl = api.config.isEmbeddedApp
      ? await api.auth.getEmbeddedAppUrl({ rawRequest: request })
      : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

    throw redirect(redirectUrl, { headers: responseHeaders });
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
    throw redirect(`${config.auth.patchSessionTokenPath}?${params.toString()}`);
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

  private respondToOptionsRequest(request: Request) {
    if (request.method === "OPTIONS") {
      throw new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Max-Age': '7200',
        }
      });
    }
  }

  private ensureResponseHeaders(request: Request, response: Response): void {
    const { config } = this;

    const shop = new URL(request.url).searchParams.get("shop")!;

    // We want the headers to be present on all responses:
    addResponseHeaders(response.headers, config.isEmbeddedApp, shop);
  }

  private overriddenRestClient(request: Request, session: Session) {
    const { api, config, logger } = this;

    const RestClient = api.clients.Rest;
    const originalClient = new api.clients.Rest({ session });
    const originalRequest = Reflect.get(originalClient, "request");

    class RemixRestClient extends RestClient {
      protected async request(params: RequestParams): Promise<any> {
        try {
          return await originalRequest.call(this, params);
        } catch (error) {
          if (error instanceof HttpResponseError) {
            if (error.response.code === 401) {
              await redirectToAuthPage(
                { api, config, logger },
                request,
                session.shop
              );
            } else {
              // forward a minimal copy of the upstream HTTP response instead of an Error:
              throw new Response(JSON.stringify(error.response.body), {
                status: error.response.code,
                headers: {
                  'Content-Type': String(error.response.headers?.['content-type'] ?? ''),
                },
              });
            }
          } else {
            throw error;
          }
        }
      }
    }

    const client = new RemixRestClient({ session });

    Object.entries(api.rest).forEach(([name, resource]) => {
      class RemixResource extends resource {
        public static Client = RemixRestClient;
      }

      Reflect.defineProperty(RemixResource, "name", {
        value: name,
      });

      Reflect.set(client, name, RemixResource);
    });

    return client as typeof client & Resources;
  }

  private createBillingContext(
    request: Request,
    session: Session
  ): BillingContext<Config> {
    const { api, logger, config } = this;

    return {
      require: requireBillingFactory({ api, logger, config }, request, session),
      request: requestBillingFactory({ api, logger, config }, request, session),
      cancel: cancelBillingFactory({ api, logger, config }, request, session),
    };
  }

  private createAdminApiContext(
    request: Request,
    session: Session
  ): AdminApiContext<Resources> {
    const { api, config, logger } = this;

    return {
      rest: this.overriddenRestClient(request, session),
      graphql: graphqlClientFactory({
        params: { api, config, logger },
        request,
        session,
      }),
    };
  }
}
