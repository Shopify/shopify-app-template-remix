import { ApiVersion, ShopifyRestResources } from "@shopify/shopify-api";

import { BasicParams, MandatoryTopics } from "../../types";

import { WebhookContext } from "./types";

export function authenticateWebhookFactory<
  Resources extends ShopifyRestResources,
  Topics extends string | number | symbol | MandatoryTopics
>({ api, config, logger }: BasicParams) {
  return async function authenticate(
    request: Request
  ): Promise<WebhookContext<Topics, Resources>> {
    if (request.method !== "POST") {
      logger.debug(
        "Received a non-POST request for a webhook. Only POST requests are allowed.",
        { url: request.url, method: request.method }
      );
      throw new Response(undefined, { status: 405, statusText: "Method not allowed" });
    }

    const rawBody = await request.text();

    const check = await api.webhooks.validate({
      rawBody,
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
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      session,
      admin: {
        rest: restClient as typeof restClient & Resources,
        graphql: graphqlClient,
      },
    };
  };
}
