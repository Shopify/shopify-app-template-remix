import {
  AppSubscription,
  BillingCheckParams,
  BillingCheckResponseObject,
  BillingRequestParams,
} from "@shopify/shopify-api";

import { AppConfigArg } from "../config-types";

export interface RequireBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, "session" | "plans"> {
  onFailure: (error: any) => Promise<Response>;
  plans: (keyof Config["billing"])[];
}

export interface RequestBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingRequestParams, "session" | "plan"> {
  plan: keyof Config["billing"];
}

export interface CancelBillingOptions {
  subscriptionId: string;
  isTest?: boolean;
  prorate?: boolean;
}

export interface BillingContext<Config extends AppConfigArg> {
  require: (
    options: RequireBillingOptions<Config>
  ) => Promise<BillingCheckResponseObject>;
  request: (options: RequestBillingOptions<Config>) => Promise<never>;
  cancel: (options: CancelBillingOptions) => Promise<AppSubscription>;
}
