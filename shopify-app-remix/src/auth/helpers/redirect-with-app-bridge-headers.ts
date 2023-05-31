import { BasicParams } from "../../types";

export const APP_BRIDGE_REAUTH_HEADER =
  "X-Shopify-API-Request-Failure-Reauthorize-Url";

export function redirectWithAppBridgeHeaders(
  params: BasicParams,
  shop: string
): never {
  const { config } = params;
  const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

  throw new Response(undefined, {
    status: 401,
    statusText: "Unauthorized",
    headers: { [APP_BRIDGE_REAUTH_HEADER]: redirectUri },
  });
}
