import { JwtPayload } from "@shopify/shopify-api";

export interface BuyerContext {
  sessionToken: JwtPayload;
}
