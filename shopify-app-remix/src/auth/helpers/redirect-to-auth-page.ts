import { BasicParams } from "../../types";

import { beginAuth } from "./begin-auth";
import { redirectWithExitIframe } from "./redirect-with-exitiframe";
import { redirectWithAppBridgeHeaders } from "./redirect-with-app-bridge-headers";

export async function redirectToAuthPage(
  params: BasicParams,
  request: Request,
  shop: string,
  isOnline: boolean = false
): Promise<never> {
  const url = new URL(request.url);
  const isEmbeddedRequest = url.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  if (isXhrRequest) {
    redirectWithAppBridgeHeaders(params, shop);
  } else if (isEmbeddedRequest) {
    redirectWithExitIframe(params, request, shop);
  } else {
    throw await beginAuth(params, request, isOnline, shop);
  }
}
