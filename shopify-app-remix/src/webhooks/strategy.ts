import {
  ApiVersion,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { AppConfig } from "../config-types";

import { WebhookContext } from "./types";

export class WebhookStrategy<Resources extends ShopifyRestResources = any> {
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify["logger"];

  public constructor({ api, config, logger }: BasicParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async authenticate(
    request: Request
  ): Promise<WebhookContext<Resources>> {
    const { api, config, logger } = this;

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

    const restClient = new api.clients.Rest({
      session,
      apiVersion: check.apiVersion as ApiVersion,
    });
    const graphqlClient = new api.clients.Graphql({
      session,
      apiVersion: check.apiVersion as ApiVersion,
    });

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
        rest: restClient as typeof restClient & Resources,
        graphql: graphqlClient,
      },
    };
  }
}
