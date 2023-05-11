import { Session, Shopify, ShopifyRestResources } from "@shopify/shopify-api";

export interface RegisterWebhooksOptions {
  session: Session;
}

export interface WebhookContext<Resources extends ShopifyRestResources = any> {
  apiVersion: string;
  shop: string;
  topic: string;
  webhookId: string;
  session: Session;
  admin: {
    rest: InstanceType<Shopify["clients"]["Rest"]> & Resources;
    graphql: InstanceType<Shopify["clients"]["Graphql"]>;
  };
}
