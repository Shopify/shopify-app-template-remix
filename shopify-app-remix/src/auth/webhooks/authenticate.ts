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
    // TODO: Webhooks can only be POST requests, we should fail early in any other scenario
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378576
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
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      session,
      admin: {
        rest: restClient as typeof restClient & Resources,
        graphql: graphqlClient,
      },
    };
  };
}
