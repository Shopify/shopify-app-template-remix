import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig } from "./config-types.js";
import {
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
  OAuthContext,
} from "./auth/types";
import { RegisterWebhooksOptions } from "./webhooks/types.js";
import { WebhookContext } from "./webhooks/types.js";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}

export interface ShopifyApp<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Storage extends SessionStorage = SessionStorage,
  Config extends AppConfig<Storage> = AppConfig<Storage>,
  Resources extends ShopifyRestResources = any
> {
  config: Config;
  registerWebhooks: (
    options: RegisterWebhooksOptions
  ) => Promise<RegisterReturn>;
  authenticate: {
    oauth: (request: Request) => Promise<OAuthContext<SessionContext>>;
    webhook: (request: Request) => Promise<WebhookContext<Resources>>;
  };
}
