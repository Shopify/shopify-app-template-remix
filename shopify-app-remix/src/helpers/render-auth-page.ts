import { BasicParams } from "../types";
import { redirectWithExitIframe } from "./redirect-with-exitiframe";
import { respondWithAppBridgeRedirectHeaders } from "./respond-with-app-bridge-redirect-headers";

export async function renderAuthPage(params: BasicParams, request: Request, shop: string): Promise<never> {
  const { api, config } = params;
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  if (isXhrRequest) {
    respondWithAppBridgeRedirectHeaders(params, shop);
  } else if (isEmbeddedRequest) {
    redirectWithExitIframe(params, request, shop);
  } else {
    throw await api.auth.begin({
      shop,
      callbackPath: config.auth.callbackPath,
      isOnline: false,
      rawRequest: request,
    });
  }
}
