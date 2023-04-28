import { Shopify } from "@shopify/shopify-api";

import { AppConfigInterface } from "./config-types";

export interface ApiAndConfigParams {
  api: Shopify;
  config: AppConfigInterface;
}
