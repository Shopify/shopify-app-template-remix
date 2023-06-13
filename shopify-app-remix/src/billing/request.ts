import {
  BillingRequestResponseObject,
  HttpResponseError,
  Session,
} from "@shopify/shopify-api";
import { redirect } from "@remix-run/server-runtime";

import { BasicParams } from "../types";
import { redirectToAuthPage } from "../auth/helpers";
import { AppConfigArg } from "../config-types";

import { RequestBillingOptions } from "./types";
import { getAppBridgeHeaders } from "../auth/helpers/redirect-with-app-bridge-headers";

export function requestBillingFactory<Config extends AppConfigArg>(
  params: BasicParams,
  request: Request,
  session: Session
) {
  return async function requestBilling({
    plan,
    isTest,
    returnUrl,
  }: RequestBillingOptions<Config>): Promise<never> {
    const { api, logger } = params;

    logger.info("Requesting billing", {
      shop: session.shop,
      plan,
      isTest,
      returnUrl,
    });

    let result: BillingRequestResponseObject;
    try {
      result = await api.billing.request({
        plan: plan as string,
        session,
        isTest,
        returnUrl,
        returnObject: true,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", {
          shop: session.shop,
        });
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }

    throw redirectOutOfApp(params, request, result.confirmationUrl);
  };
}

function redirectOutOfApp(
  params: BasicParams,
  request: Request,
  url: string
): Response {
  const { config, logger } = params;

  logger.debug("Redirecting out of app", { url });

  const requestUrl = new URL(request.url);
  const isEmbeddedRequest = requestUrl.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  if (isXhrRequest) {
    // TODO Check this with the beta flag disabled (with the bounce page)
    // Remix is not including the X-Shopify-API-Request-Failure-Reauthorize-Url when throwing a Response
    // https://github.com/remix-run/remix/issues/5356
    throw new Response(undefined, {
      status: 302,
      statusText: "Redirect",
      headers: getAppBridgeHeaders(url),
    });
  } else if (isEmbeddedRequest) {
    const params = new URLSearchParams({
      shop: requestUrl.searchParams.get("shop")!,
      host: requestUrl.searchParams.get("host")!,
      exitIframe: url,
    });

    return redirect(`${config.auth.exitIframePath}?${params.toString()}`);
  } else {
    // This will only ever happen for non-embedded apps, because the authenticator will stop before reaching this point
    return redirect(url);
  }
}
