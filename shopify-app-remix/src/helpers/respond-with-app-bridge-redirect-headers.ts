import { AppConfig } from "../config-types";

export function respondWithAppBridgeRedirectHeaders(config: AppConfig, shop: string): void {
  const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

  throw new Response(undefined, {
    status: 401,
    statusText: "Unauthorized",
    headers: { "X-Shopify-API-Request-Failure-Reauthorize-Url": redirectUri },
  });
}
