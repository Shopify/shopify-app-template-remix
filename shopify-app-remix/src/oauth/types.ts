import {
  JwtPayload,
  Session,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AdminContext, AppConfigArg } from "../config-types";
import { BillingContext } from "../billing/types";

interface OAuthContextInternal<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> {
  session: Session;
  admin: AdminContext<Resources>;
  billing: BillingContext<Config>;
}

export interface EmbeddedOAuthContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends OAuthContextInternal<Config, Resources> {
  sessionToken: JwtPayload;
}
export interface NonEmbeddedOAuthContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends OAuthContextInternal<Config, Resources> {}

export type OAuthContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = Config["isEmbeddedApp"] extends true
  ? EmbeddedOAuthContext<Config, Resources>
  : Config["isEmbeddedApp"] extends false
  ? NonEmbeddedOAuthContext<Config, Resources>
  : never;
