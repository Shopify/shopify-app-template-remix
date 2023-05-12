import isbot from "isbot";
import { BasicParams } from "../types";

import { RequestBillingOptions } from "./types";
import { Session } from "@shopify/shopify-api";

import { redirectOutOfApp } from "../helpers";

export function requestBillingFactory(params: BasicParams) {
  return async function requestBilling(
    request: Request,
    session: Session,
    { plan, isTest = true, returnUrl }: RequestBillingOptions
  ) {
    const { api, logger } = params;

    if (isbot(request.headers.get("User-Agent"))) {
      logger.debug("Request is from a bot, skipping auth");
      throw new Response(undefined, { status: 400, statusText: "Bad Request" });
    }

    logger.info("Requesting billing", {
      shop: session.shop,
      plan,
      isTest,
      returnUrl,
    });

    const redirectUrl = await api.billing.request({
      plan,
      session,
      isTest,
      returnUrl,
    });

    throw redirectOutOfApp(params, request, redirectUrl);
  };
}
