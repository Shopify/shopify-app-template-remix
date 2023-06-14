import { BasicParams } from "../../types";

export const REAUTH_URL_HEADER =
  "X-Shopify-API-Request-Failure-Reauthorize-Url";

export const APP_BRIDGE_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization",
  "Access-Control-Expose-Headers": REAUTH_URL_HEADER,
};

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
  return {
    ...APP_BRIDGE_HEADERS,
    [REAUTH_URL_HEADER]: url,
  }
}
