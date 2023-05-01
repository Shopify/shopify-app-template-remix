import { Shopify } from "@shopify/shopify-api";

import { AppConfig } from "./config-types.js";

export interface BasicParams {
  api: Shopify;
  config: AppConfig;
  logger: Shopify["logger"];
}
