import { BasicParams } from "../../types";

import { RegisterWebhooksOptions } from "./types";

export function registerWebhooksFactory({ api, logger }: BasicParams) {
  return async function registerWebhooks({ session }: RegisterWebhooksOptions) {
    return api.webhooks.register({ session }).then((response) => {
      Object.entries(response).forEach(([topic, topicResults]) => {
        topicResults.forEach(({ success, result }) => {
          if (success) {
            // TODO: start returning the webhook operation from the library, and log it here
            // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28379073
            logger.debug("Registered webhook", { topic, shop: session.shop });
          } else {
            logger.error("Failed to register webhook", {
              topic,
              shop: session.shop,
              result,
            });
          }
        });
      });

      return response;
    });
  };
}
