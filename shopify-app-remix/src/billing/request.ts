import { Session } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { redirectOutOfApp } from "../helpers";
import { RequestBillingOptions } from "./types";

export function requestBillingFactory(
  params: BasicParams,
  request: Request,
  session: Session
) {
  return async function requestBilling({
    plan,
    isTest,
    returnUrl,
  }: RequestBillingOptions) {
    const { api, logger } = params;

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
