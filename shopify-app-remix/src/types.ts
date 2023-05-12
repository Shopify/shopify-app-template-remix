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

type RegisterWebhooks = (
  options: RegisterWebhooksOptions
) => Promise<RegisterReturn>;

type AuthenticateOAuth<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = any
> = (request: Request) => Promise<OAuthContext<SessionContext, Resources>>;

type AuthenticateWebhook<Resources extends ShopifyRestResources = any> = (
  request: Request
) => Promise<WebhookContext<Resources>>;

export interface ShopifyApp<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Storage extends SessionStorage = SessionStorage,
  Config extends AppConfig<Storage> = AppConfig<Storage>,
  Resources extends ShopifyRestResources = any
> {
  config: Config;
  registerWebhooks: RegisterWebhooks;
  authenticate: {
    oauth: AuthenticateOAuth<SessionContext, Resources>;
    webhook: AuthenticateWebhook<Resources>;
  };
}
