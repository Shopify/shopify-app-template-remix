import { Session, Shopify } from "@shopify/shopify-api";

import { BasicParams } from "../types";
import { AppConfig } from "../config-types";

import { BillingAuthenticateOptions, BillingContext } from "./types";

export class BillingStrategy {
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify["logger"];

  public constructor({ api, config, logger }: BasicParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async authenticate(
    session: Session,
    options: BillingAuthenticateOptions
  ): Promise<BillingContext> {
    const { api, logger } = this;

    const logContext = {
      shop: session.shop,
      plans: options.plans,
      isTest: options.isTest,
    };

    logger.debug("Checking billing for the shop", logContext);

    // TODO Return the full info once the feature is deployed into the library package
    const success = await api.billing.check({
      session,
      plans: options.plans,
      isTest: options.isTest,
    });

    if (!success) {
      logger.debug("Billing check failed", logContext);
      throw await options.onFailure(new Error("Billing check failed"));
    }

    logger.debug("Billing check succeeded", logContext);

    return { success };
  }
}
