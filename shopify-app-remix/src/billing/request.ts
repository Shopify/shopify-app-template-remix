import { HttpResponseError, Session } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { redirectOutOfApp, renderAuthPage } from "../helpers";
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
  }: RequestBillingOptions<Config>): Promise<never> {
    const { api, logger } = params;

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
        throw await renderAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
    throw redirectOutOfApp(params, request, redirectUrl);
  };
}
