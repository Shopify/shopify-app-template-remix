import { redirect } from "@remix-run/server-runtime";
import {
  HttpResponseError,
  Session,
  Shopify,
} from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { redirectOutOfApp } from "../helpers";
import { AppConfig, AppConfigArg } from "../config-types";

import { RequestBillingOptions } from "./types";

export function requestBillingFactory<Config extends AppConfigArg>(
  params: BasicParams,
  request: Request,
  session: Session
) {
  return async function requestBilling({
    plan,
    isTest,
    returnUrl,
  }: RequestBillingOptions<Config>) {
    const { api, config, logger } = params;

    logger.info("Requesting billing", {
      shop: session.shop,
      plan,
      isTest,
      returnUrl,
    });

    let redirectUrl: string;

    try {
      redirectUrl = await api.billing.request({
        plan: plan as string,
        session,
        isTest,
        returnUrl,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        await renderAuthPage(api, config, request, session.shop);
      } else {
        throw error;
      }
    }
    throw redirectOutOfApp(params, request, redirectUrl!);
  };
}

async function renderAuthPage(api: Shopify, config: AppConfig, request: Request, shop: string): Promise<void> {
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

function redirectWithExitIframe(api: Shopify, config: AppConfig, request: Request, shop: string): void {
  const url = new URL(request.url);

  const queryParams = url.searchParams;
  queryParams.set("shop", shop);
  queryParams.set("host", api.utils.sanitizeHost(queryParams.get("host")!)!);
  queryParams.set("exitIframe", `${config.auth.path}?shop=${shop}`);

  throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
}

function respondWithAppBridgeRedirectHeaders(config: AppConfig, shop: string): void {
  const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

  throw new Response(undefined, {
    status: 401,
    statusText: "Unauthorized",
    headers: { "X-Shopify-API-Request-Failure-Reauthorize-Url": redirectUri },
  });
}
