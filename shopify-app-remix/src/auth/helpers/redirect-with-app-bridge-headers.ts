import { BasicParams } from "../../types";

export const REAUTH_URL_HEADER =
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
    headers: getAppBridgeHeaders(redirectUri),
  });
}

export function getAppBridgeHeaders(url: string) {
  return { [REAUTH_URL_HEADER]: url, 'Access-Control-Expose-Headers': REAUTH_URL_HEADER }
}
