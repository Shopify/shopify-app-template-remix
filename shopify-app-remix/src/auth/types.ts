import { JwtPayload, Session, Shopify } from "@shopify/shopify-api";

import type { AppConfigArg } from "../config-types";

export interface AdminContext {
  rest: InstanceType<Shopify["clients"]["Rest"]> & {
    // TODO: Wrap in functionality to detect failurs and throw Responses
    // // TODO: Use the patched client for the resources as well
    // ...restResources
  };
  // TODO improve the public API in @shopify/shopify-api GraphQL client
  // TODO: Wrap in functionality to detect failurs and throw Responses
  // graphql: Shopify["clients"]["Graphql"];
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
  T extends EmbeddedSessionContext | NonEmbeddedSessionContext
> {
  session: T;
  admin: AdminContext;
}

export type SessionContextType<T extends AppConfigArg> =
  T["isEmbeddedApp"] extends true
    ? EmbeddedSessionContext
    : T["isEmbeddedApp"] extends false
    ? NonEmbeddedSessionContext
    : never;
