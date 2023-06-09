import { Session, Shopify, ShopifyRestResources } from "@shopify/shopify-api";
import { JSONValue } from "src/types";

export interface RegisterWebhooksOptions {
  session: Session;
}

export interface WebhookContext<
  Topics = string | number | symbol,
  Resources extends ShopifyRestResources = any
> {
  apiVersion: string;
  shop: string;
  topic: Topics;
  webhookId: string;
  payload: JSONValue;
  session: Session;
  admin: {
    rest: InstanceType<Shopify["clients"]["Rest"]> & Resources;
    graphql: InstanceType<Shopify["clients"]["Graphql"]>;
  };
}
