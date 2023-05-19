import { BasicParams } from "../../types";

export function redirectWithAppBridgeHeaders(
  params: BasicParams,
  shop: string
): never {
  const { config } = params;
  const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

  throw new Response(undefined, {
    status: 401,
    statusText: "Unauthorized",
    headers: { "X-Shopify-API-Request-Failure-Reauthorize-Url": redirectUri },
  });
}
