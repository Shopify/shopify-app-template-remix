import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig, AppConfigArg } from "./config-types";
import { AdminContext } from "./auth/admin/types";
import { StorefrontContext } from "./auth/storefront/types";
import { RegisterWebhooksOptions } from "./auth/webhooks/types";
import { WebhookContext } from "./auth/webhooks/types";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}

type RegisterWebhooks = (
  options: RegisterWebhooksOptions
) => Promise<RegisterReturn>;

type AuthenticateAdmin<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = (request: Request) => Promise<AdminContext<Config, Resources>>;

type AuthenticateStorefront = (request: Request) => Promise<StorefrontContext>;

type AuthenticateWebhook<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Topics = string | number | symbol
> = (request: Request) => Promise<WebhookContext<Topics, Resources>>;

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
    admin: AuthenticateAdmin<Config, RestResourcesType<Config>>;
    storefront: AuthenticateStorefront;
    webhook: AuthenticateWebhook<
      RestResourcesType<Config>,
      keyof Config["webhooks"] | MandatoryTopics
    >;
  };
}

export type MandatoryTopics =
  | "CUSTOMERS_DATA_REQUEST"
  | "CUSTOMERS_REDACT"
  | "SHOP_REDACT";
