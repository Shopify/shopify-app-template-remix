import { BasicParams } from "../../types";
import { addResponseHeaders } from "./add-response-headers";

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
    headers: getAppBridgeHeaders(params, redirectUri, shop),
  });
}

export function getAppBridgeHeaders(params: BasicParams, url: string, shop: string) {
  const { config } = params;
  const headers = new Headers({[REAUTH_URL_HEADER]: url});

  addResponseHeaders(headers, config.isEmbeddedApp, shop);

  return headers;
}
