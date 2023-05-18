import { BasicParams } from "../types";
import { beginAuth } from "./begin-auth";
import { redirectWithExitIframe } from "./redirect-with-exitiframe";
import { respondWithAppBridgeRedirectHeaders } from "./respond-with-app-bridge-redirect-headers";

export async function renderAuthPage(
  params: BasicParams,
  request: Request,
  shop: string,
  isOnline: boolean = false
): Promise<never> {
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  if (isXhrRequest) {
    respondWithAppBridgeRedirectHeaders(params, shop);
  } else if (isEmbeddedRequest) {
    redirectWithExitIframe(params, request, shop);
  } else {
    throw await beginAuth(params, request, isOnline, shop);
  }
}
