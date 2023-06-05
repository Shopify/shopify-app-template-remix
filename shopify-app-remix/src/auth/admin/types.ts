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
  /**
   * The session for the user who made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.  If you did not provide a session storage adaptor `shopifyApp` uses `SQLiteSessionStorage`
   *
   * Use this to get shop or user specific data.
   *
   * @example
   * Getting your app's shop specific widget data using an offline session
   * ```ts
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { shopify } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await shopify.authenticate.admin(
   *     request
   *   );
   *   return json(await getWidgets({shop: session.shop));
   * };
   * ```
   *
   * @example
   * Getting your app's user specific widget data using an online session
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   *
   * export const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   *
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { shopify } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await shopify.authenticate.admin(
   *     request
   *   );
   *   return json(await getWidgets({user: session.onlineAccessInfo!.id}));
   * };
   * ```
   */
  session: Session;
  /**
   * Methods for interacting with the Shopify GraphQL / REST Admin APIs for the store that made the request
   */
  admin: AdminApiContext<Resources>;
  /**
   * Billing methods for this store
   */
  billing: BillingContext<Config>;
}

export interface EmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources
> extends AdminContextInternal<Config, Resources> {
  /**
   * The decoded and validated session token for the request
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * Getting your app's user specific widget data using the session token
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   *
   * export const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   *
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { shopify } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken } = await shopify.authenticate.storefront(
   *     request
   *   );
   *   return json(await getWidgets({user: sessionToken.sub}));
   * };
   * ```
   */
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
