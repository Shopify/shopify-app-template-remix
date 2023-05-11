import { Strategy, StrategyVerifyCallback } from "remix-auth";
import { Shopify } from "@shopify/shopify-api";

import { BasicParams } from "../types.js";
import { AppConfig } from "../config-types.js";

import { WebhookContext } from "./types.js";

export class WebhookStrategyInternal extends Strategy<WebhookContext, any> {
  name = "ShopifyAppWebhookStrategy";

  protected static api: Shopify;
  protected static config: AppConfig;
  protected static logger: Shopify["logger"];

  constructor() {
    super(verifyAuth);
  }

  public async authenticate(request: Request): Promise<WebhookContext> {
    const { api, config, logger } = this.strategyClass();

    const check = await api.webhooks.validate({
      rawBody: await request.text(),
      rawRequest: request,
    });

    if (!check.valid) {
      logger.debug("Webhook validation failed", check);
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }

    const sessionId = api.session.getOfflineId(check.domain);
    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.debug("No session found for shop", check);
      throw new Response(undefined, { status: 404, statusText: "Not found" });
    }

    const restClient = new api.clients.Rest({ session });
    const graphqlClient = new api.clients.Graphql({ session });

    Object.entries(api.rest).forEach(([name, resource]) => {
      Reflect.set(restClient, name, resource);
    });

    return {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic,
      webhookId: check.webhookId,
      session,
      admin: {
        rest: restClient,
        graphql: graphqlClient,
      },
    };
  }

  private strategyClass() {
    return this.constructor as typeof WebhookStrategyInternal;
  }
}

// TODO figure out the User type here
// TODO look at the docs and implement this
const verifyAuth: StrategyVerifyCallback<any, {}> = async (_params: {}) => {};

export function webhookStrategyFactory(
  params: BasicParams
): typeof WebhookStrategyInternal {
  const { api, config, logger } = params;

  class WebhookStrategy extends WebhookStrategyInternal {
    protected static api = api;
    protected static config = config;
    protected static logger = logger;

    constructor() {
      super();
    }
  }

  Reflect.defineProperty(WebhookStrategy, "name", {
    value: "WebhookStrategyInternal",
  });

  return WebhookStrategy as typeof WebhookStrategyInternal;
}
