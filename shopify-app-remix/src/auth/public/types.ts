import { JwtPayload } from "@shopify/shopify-api";

/**
 * Authenticated Context for a public request
 */
export interface PublicContext {
  /**
   * The decoded and validated session token for the request
   *
   * The payload of the Session Token is described here: {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * Getting your app's store specific widget data using the session token
   * // app/routes/public/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { shopify } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken } = await shopify.authenticate.public(
   *     request
   *   );
   *   return json(await getWidgets({shop: sessionToken.dest}));
   * };
   */
  sessionToken: JwtPayload;
}
