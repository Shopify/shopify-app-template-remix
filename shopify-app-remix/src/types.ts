import {
  RegisterReturn,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig, AppConfigArg } from "./config-types";
import { MerchantContext } from "./auth/merchant/types";
import { BuyerContext } from "./auth/buyer/types";
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

type AuthenticateMerchant<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = (request: Request) => Promise<MerchantContext<Config, Resources>>;

type AuthenticateBuyer = (request: Request) => Promise<BuyerContext>;

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
    merchant: AuthenticateMerchant<Config, RestResourcesType<Config>>;
    buyer: AuthenticateBuyer;
    webhook: AuthenticateWebhook<RestResourcesType<Config>>;
  };
}
