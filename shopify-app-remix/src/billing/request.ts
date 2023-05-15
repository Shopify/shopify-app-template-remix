import { Session } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { redirectOutOfApp } from "../helpers";
import { AppConfigArg } from "../config-types";

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
    const { api, logger } = params;

    logger.info("Requesting billing", {
      shop: session.shop,
      plan,
      isTest,
      returnUrl,
    });

    const redirectUrl = await api.billing.request({
      plan: plan as string,
      session,
      isTest,
      returnUrl,
    });

    throw redirectOutOfApp(params, request, redirectUrl);
  };
}
