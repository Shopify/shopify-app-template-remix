import { BasicParams } from "../../types";

import { RegisterWebhooksOptions } from "./types";

export function registerWebhooksFactory({ api, logger }: BasicParams) {
  return async function registerWebhooks({ session }: RegisterWebhooksOptions) {
    return api.webhooks.register({ session }).then((response) => {
      Object.entries(response).forEach(([topic, topicResults]) => {
        topicResults.forEach(({ success, ...result }) => {
          if (success) {
            logger.debug("Registered webhook", {
              topic,
              shop: session.shop,
              operation: result.operation,
            });
          } else {
            logger.error("Failed to register webhook", {
              topic,
              shop: session.shop,
              result: result.result,
            });
          }
        });
      });

      return response;
    });
  };
}
