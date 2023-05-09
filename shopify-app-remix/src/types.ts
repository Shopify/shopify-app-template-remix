import { Shopify, ShopifyRestResources } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfig } from "./config-types.js";
import {
  Context,
  EmbeddedSessionContext,
  NonEmbeddedSessionContext,
} from "./auth/types";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}

export interface ShopifyApp<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Storage extends SessionStorage = SessionStorage,
  Resources extends ShopifyRestResources = any,
  Config extends AppConfig<Storage> = AppConfig<Storage>
> {
  config: Config;
  auth: {
    oauth: (request: Request) => Promise<Context<SessionContext, Resources>>;
  };
}
