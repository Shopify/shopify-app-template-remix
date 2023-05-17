import { Shopify } from "@shopify/shopify-api";

import { AppConfig } from "../config-types";
import { redirectWithExitIframe } from "./redirect-with-exitiframe";
import { respondWithAppBridgeRedirectHeaders } from "./respond-with-app-bridge-redirect-headers";

export async function renderAuthPage(api: Shopify, config: AppConfig, request: Request, shop: string): Promise<void> {
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  if (isXhrRequest) {
    respondWithAppBridgeRedirectHeaders(config, shop);
  } else if (isEmbeddedRequest) {
    redirectWithExitIframe(api, config, request, shop);
  } else {
    throw await api.auth.begin({
      shop,
      callbackPath: config.auth.callbackPath,
      isOnline: false,
      rawRequest: request,
    });
  }
}
