import { BasicParams } from "../types";

export async function beginAuth(
  params: BasicParams,
  request: Request,
  isOnline: boolean,
  shop: string
): Promise<void> {
  const { api, config } = params;

  throw await api.auth.begin({
    shop,
    callbackPath: config.auth.callbackPath,
    isOnline,
    rawRequest: request,
  });
}
