// TODO: Export this out of the library
import {
  CheckParams as BillingCheckParams,
  RequestParams as BillingRequestParams,
} from "node_modules/@shopify/shopify-api/lib/billing/types";

export interface RequireBillingOptions
  extends Omit<BillingCheckParams, "session"> {
  onFailure: (error: any) => Promise<void>;
}

export type RequestBillingOptions = Omit<BillingRequestParams, "session">;

export interface BillingContext {
  require: (options: RequireBillingOptions) => Promise<boolean>;
  request: (options: RequestBillingOptions) => Promise<never>;
}
