import { Session } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { RequireBillingOptions } from "./types";

export function requireBillingFactory(
  { api, logger }: BasicParams,
  session: Session
) {
  return async function requireBilling(options: RequireBillingOptions) {
    const logContext = {
      shop: session.shop,
      plans: options.plans,
      isTest: options.isTest,
    };

    logger.debug("Checking billing for the shop", logContext);

    // TODO Return the full info once the feature is deployed into the library package
    const result = await api.billing.check({ session, ...options });

    if (!result) {
      logger.debug("Billing check failed", logContext);
      throw await options.onFailure(new Error("Billing check failed"));
    }

    logger.debug("Billing check succeeded", logContext);

    return result;
  };
}
