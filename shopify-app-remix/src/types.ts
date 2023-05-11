import { RegisterReturn, Shopify } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig } from "./config-types.js";
import { AuthStrategyInternal } from "./auth/index.js";
import {
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
} from "./auth/types";
import { RegisterWebhooksOptions } from "./webhooks/types.js";

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
  AuthStrategy: typeof AuthStrategyInternal<SessionContext>;
}
