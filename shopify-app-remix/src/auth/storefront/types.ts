import { JwtPayload } from "@shopify/shopify-api";

/**
 * Authenticated Context for a storefront request
 */
export interface StorefrontContext {
  /**
   * The decoded and validated session token for the request
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * Getting your app's user specific widget data using the session token
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
   */
  sessionToken: JwtPayload;
}
