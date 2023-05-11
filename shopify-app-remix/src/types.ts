import { RegisterReturn, Shopify } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig } from "./config-types.js";
import { AuthStrategyInternal } from "./auth/index.js";
import {
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
} from "./auth/types";
import { RegisterWebhooksOptions } from "./webhooks/types.js";
import { WebhookStrategyInternal } from "./webhooks/strategy.js";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}

export interface ShopifyApp<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Storage extends SessionStorage = SessionStorage,
  Config extends AppConfig<Storage> = AppConfig<Storage>
> {
  config: Config;
  registerWebhooks: (
    options: RegisterWebhooksOptions
  ) => Promise<RegisterReturn>;
  auth: {
    OAuth: typeof AuthStrategyInternal<SessionContext>;
    Webhook: typeof WebhookStrategyInternal;
  };
}
