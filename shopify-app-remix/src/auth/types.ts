import {
  JwtPayload,
  Session,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AdminContext, AppConfigArg } from "../config-types";

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
