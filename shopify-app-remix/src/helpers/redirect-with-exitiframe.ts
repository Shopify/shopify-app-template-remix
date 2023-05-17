import { redirect } from "@remix-run/server-runtime";
import { Shopify } from "@shopify/shopify-api";

import { AppConfig } from "../config-types";

export function redirectWithExitIframe(api: Shopify, config: AppConfig, request: Request, shop: string): void {
  const url = new URL(request.url);

  const queryParams = url.searchParams;
  queryParams.set("shop", shop);
  queryParams.set("host", api.utils.sanitizeHost(queryParams.get("host")!)!);
  queryParams.set("exitIframe", `${config.auth.path}?shop=${shop}`);

  throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
}
