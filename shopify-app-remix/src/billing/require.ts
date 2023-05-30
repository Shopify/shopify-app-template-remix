import { HttpResponseError, Session } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { RequireBillingOptions } from "./types";
import { AppConfigArg } from "../config-types";
import { redirectToAuthPage } from "../auth/helpers";

export function requireBillingFactory<Config extends AppConfigArg>(
  params: BasicParams,
  request: Request,
  session: Session
) {
  const { api, logger } = params;

  return async function requireBilling(options: RequireBillingOptions<Config>) {
    const logContext = {
      shop: session.shop,
      plans: options.plans,
      isTest: options.isTest,
    };

    logger.debug("Checking billing for the shop", logContext);

    // TODO Return the full info once the feature is deployed into the library package
    // TODO: Also, we should fail if the plan doesn't exist
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28367815
    let result: boolean;
    try {
      result = await api.billing.check({
        session,
        ...options,
        plans: options.plans as string[],
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", logContext);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }

    if (!result) {
      logger.debug("Billing check failed", logContext);
      throw await options.onFailure(new Error("Billing check failed"));
    }

    logger.debug("Billing check succeeded", logContext);

    return result;
  };
}
