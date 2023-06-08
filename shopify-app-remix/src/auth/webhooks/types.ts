import { Session, Shopify, ShopifyRestResources } from "@shopify/shopify-api";

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
  payload: any;
  session: Session;
  admin: {
    rest: InstanceType<Shopify["clients"]["Rest"]> & Resources;
    graphql: InstanceType<Shopify["clients"]["Graphql"]>;
  };
}
