import { redirect } from "@remix-run/server-runtime";
import { BasicParams } from "../types";

export function redirectWithExitIframe(params: BasicParams, request: Request, shop: string): never {
  const { api, config } = params;
  const url = new URL(request.url);

  const queryParams = url.searchParams;
  queryParams.set("shop", shop);
  queryParams.set("host", api.utils.sanitizeHost(queryParams.get("host")!)!);
  queryParams.set("exitIframe", `${config.auth.path}?shop=${shop}`);

  throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
}
