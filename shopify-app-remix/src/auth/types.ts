import {
  JwtPayload,
  Session,
  Shopify,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AppConfigArg } from "../config-types";

export interface AdminContext<R extends ShopifyRestResources = any> {
  rest: InstanceType<Shopify["clients"]["Rest"]> & R;
  // TODO improve the public API in @shopify/shopify-api GraphQL client
  graphql: InstanceType<Shopify["clients"]["Graphql"]>;
}

interface SessionContext {
  // TODO Can we use a different name for this?
  session: Session;
}

export interface EmbeddedSessionContext extends SessionContext {
  token: JwtPayload;
}
export interface NonEmbeddedSessionContext extends SessionContext {}

export interface Context<
  T extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  R extends ShopifyRestResources = any
> {
  session: T;
  admin: AdminContext<R>;
}

export type SessionContextType<T extends AppConfigArg> =
  T["isEmbeddedApp"] extends true
    ? EmbeddedSessionContext
    : T["isEmbeddedApp"] extends false
    ? NonEmbeddedSessionContext
    : never;
