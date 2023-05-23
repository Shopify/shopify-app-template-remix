import { JwtPayload } from "@shopify/shopify-api";

export interface StorefrontContext {
  sessionToken: JwtPayload;
}
