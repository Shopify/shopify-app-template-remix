import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig, AppConfigArg } from "./config-types";
import {
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
  OAuthContext,
  SessionContextType,
} from "./oauth/types";
import { RegisterWebhooksOptions } from "./webhooks/types";
import { WebhookContext } from "./webhooks/types";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}

type RegisterWebhooks = (
  options: RegisterWebhooksOptions
) => Promise<RegisterReturn>;

type AuthenticateOAuth<
  Config extends AppConfigArg,
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = (
  request: Request
) => Promise<OAuthContext<Config, SessionContext, Resources>>;

type AuthenticateWebhook<
  Resources extends ShopifyRestResources = ShopifyRestResources
> = (request: Request) => Promise<WebhookContext<Resources>>;

type RestResourcesType<Config extends AppConfigArg> =
  Config["restResources"] extends ShopifyRestResources
    ? Config["restResources"]
    : ShopifyRestResources;

type SessionStorageType<Config extends AppConfigArg> =
  Config["sessionStorage"] extends SessionStorage
    ? Config["sessionStorage"]
    : SessionStorage;

export interface ShopifyApp<Config extends AppConfigArg> {
  config: AppConfig<SessionStorageType<Config>>;
  registerWebhooks: RegisterWebhooks;
  authenticate: {
    oauth: AuthenticateOAuth<
      Config,
      SessionContextType<Config>,
      RestResourcesType<Config>
    >;
    webhook: AuthenticateWebhook<RestResourcesType<Config>>;
  };
}
