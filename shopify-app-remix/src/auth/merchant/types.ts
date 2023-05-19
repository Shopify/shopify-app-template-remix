import {
  JwtPayload,
  Session,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AdminContext, AppConfigArg } from "../../config-types";
import { BillingContext } from "../../billing/types";

interface MerchantContextInternal<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> {
  session: Session;
  admin: AdminContext<Resources>;
  billing: BillingContext<Config>;
}

export interface EmbeddedMerchantContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends MerchantContextInternal<Config, Resources> {
  sessionToken: JwtPayload;
}
export interface NonEmbeddedMerchantContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends MerchantContextInternal<Config, Resources> {}

export type MerchantContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = Config["isEmbeddedApp"] extends true
  ? EmbeddedMerchantContext<Config, Resources>
  : Config["isEmbeddedApp"] extends false
  ? NonEmbeddedMerchantContext<Config, Resources>
  : never;

export interface BuyerContext {
  sessionToken: JwtPayload;
}
