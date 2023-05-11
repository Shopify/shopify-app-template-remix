import { Session } from "@shopify/shopify-api";

export interface RegisterWebhooksOptions {
  session: Session;
}

export interface WebhookContext {
  apiVersion: string;
  shop: string;
  topic: string;
  webhookId: string;
  session: Session;
  admin: {
    rest: any;
    graphql: any;
  };
}
