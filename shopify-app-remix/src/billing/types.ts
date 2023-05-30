import { BillingCheckParams, BillingRequestParams } from "@shopify/shopify-api";
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

export interface BillingContext<Config extends AppConfigArg> {
  require: (options: RequireBillingOptions<Config>) => Promise<boolean>;
  request: (options: RequestBillingOptions<Config>) => Promise<never>;
}
