import {
  ConfigParams as ApiConfigParams,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export interface AppConfigParams<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
> {
  api?: Partial<ApiConfigParams<R>>;
  sessionStorage?: S;
}

export interface AppConfigInterface<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
> extends Omit<AppConfigParams<R, S>, "api"> {
  logger: Shopify["logger"];
  sessionStorage: S;
}
