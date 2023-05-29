import {
  JwtPayload,
  Session,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AdminApiContext, AppConfigArg } from "../../config-types";
import { BillingContext } from "../../billing/types";

interface AdminContextInternal<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> {
  session: Session;
  admin: AdminApiContext<Resources>;
  billing: BillingContext<Config>;
}

export interface EmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends AdminContextInternal<Config, Resources> {
  sessionToken: JwtPayload;
}
export interface NonEmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends AdminContextInternal<Config, Resources> {}

export type AdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> = Config["isEmbeddedApp"] extends false
  ? NonEmbeddedAdminContext<Config, Resources>
  : EmbeddedAdminContext<Config, Resources>;
