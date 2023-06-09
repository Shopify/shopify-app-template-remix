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

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }

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

/**
 * An object your app can use to interact with Shopify.
 *
 */
export interface ShopifyApp<Config extends AppConfigArg> {
  /**
   * The SessionStorage instance your app is using.
   *
   * If you passed in a custom SessionStorage instance, this will be that instance. If not, this will be an instance of `SQLiteSessionStorage`.
   *
   * @example
   * Defaulting to `SQLiteSessionStorage`
   * ```ts
   * // app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * })
   *
   * // shopify.sessionStorage is an instance of SQLiteSessionStorage
   * ```
   *
   * @example
   * Using Prisma
   * ```ts
   * // app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   * import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
   * import prisma from "~/db.server";
   *
   * const shopify = shopifyApp({
   *   sesssionStorage: new PrismaSessionStorage(prisma),
   *   // ...etc
   * })
   *
   * // shopify.sessionStorage is an instance of PrismaSessionStorage
   * ```
   */
  sessionStorage: SessionStorageType<Config>;
  /**
   * Register webhook topics for a store using the given session. Most likely you want to use this in combination with the afterAuth hook.
   *
   * @example
   * Registering webhooks when a merchant installs your app.
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix";
   *
   * export const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       shopify.registerWebhooks({ session });
   *     }
   *   },
   *   webhooks: {
   *     APP_UNINSTALLED: {
   *       deliveryMethod: DeliveryMethod.Http,
   *        callbackUrl: "/webhooks",
   *     },
   *   },
   *   // ...etc
   * });
   * ```
   */
  registerWebhooks: RegisterWebhooks;

  /**
   * Ways to authenticate requests from different surfaces across Shopify.
   *
   */
  authenticate: {
    /**
     * Authenticate an admin Request and get back an authenticated admin context.  Use the authenticated admin context to interact with Shopify
     *
     * Examples of when to use this are requests from your app's UI, or requests from admin extensions.
     *
     * If there is no session for the Request, this will redirect the merchant to correct auth flows.
     *
     * @param request `Request` The incoming request to authenticate
     * @returns `Promise<AdminContext<Config, Resources>>` An authenticated admin context
     *
     * @example
     * Registering webhooks and seeding data when a merchant installs your app.
     * ```ts
     * // app/shopify.server.ts
     * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix";
     * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
     *
     * export const shopify = shopifyApp({
     *   restResources,
     *   // ...etc
     * });
     *
     * // app/routes/**\/*.jsx
     * import { LoaderArgs, json } from "@remix-run/node";
     * import { shopify } from "../../shopify.server";
     *
     * export async function loader({ request }: LoaderArgs) {
     *   const {admin, session, sessionToken, billing} = shopify.authenticate.admin(request);
     *
     *   return json(await admin.rest.Product.count({ session }));
     * }
     * ```
     */
    admin: AuthenticateAdmin<Config, RestResourcesType<Config>>;

    /**
     * Authenticate a storefront request and get back a session token
     *
     * An example of when to use this is a request from a checkout extension.
     *
     * @param request `Request` The incoming request to authenticate
     * @returns `Promise<StorefrontContext>` An authenticated storefront context
     *
     * @example
     * Authenticating a request from a checkout extension
     *
     * ```ts
     * // app/routes/api/checkout.jsx
     * import { LoaderArgs, json } from "@remix-run/node";
     * import { shopify } from "../../shopify.server";
     * import { getWidgets } from "~/db/widgets";
     *
     * export async function loader({ request }: LoaderArgs) {
     *   const {sessionToken} = shopify.authenticate.storefront(request);
     *
     *   return json(await getWidgets(sessionToken));
     * }
     * ```
     */
    storefront: AuthenticateStorefront;

    /**
     * Authenticate a Shopify webhook request, get back an authenticated admin context and details on the webhook request
     *
     * @param request `Request` The incoming request to authenticate
     * @returns `Promise<StorefrontContext>` An authenticated storefront context
     *
     * @example
     * Authenticating a webhook request
     *
     * ```ts
     * // app/routes/api/checkout.jsx
     * import {
     *   DeliveryMethod,
     *   shopifyApp,
     * } from "@shopify/shopify-app-remix";
     *
     * export const shopify = shopifyApp({
     *   webhooks: {
     *    APP_UNINSTALLED: {
     *       deliveryMethod: DeliveryMethod.Http,
     *       callbackUrl: "/webhooks",
     *     },
     *   },
     *   hooks: {
     *     afterAuth: async ({ session }) => {
     *       shopify.registerWebhooks({ session });
     *     },
     *   },
     *   // ...etc
     * });
     *
     * // app/routes/webhooks.ts
     * import { ActionArgs } from "@remix-run/node";
     * import { shopify } from "../shopify.server";
     * import db from "../db.server";
     *
     * export const action = async ({ request }: ActionArgs) => {
     *   const { topic, shop, admin, payload } = await shopify.authenticate.webhook(request);
     *
     *   switch (topic) {
     *     case "APP_UNINSTALLED":
     *       await db.session.deleteMany({ where: { shop } });
     *       break;
     *     case "CUSTOMERS_DATA_REQUEST":
     *     case "CUSTOMERS_REDACT":
     *     case "SHOP_REDACT":
     *     default:
     *       throw new Response("Unhandled webhook topic", { status: 404 });
     *   }
     *
     *   throw new Response();
     * };
     * ```
     */
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
