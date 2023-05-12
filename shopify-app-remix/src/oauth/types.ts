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

export interface OAuthContext<
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = any
> {
  session: SessionContext;
  admin: AdminContext<Resources>;
}

export type SessionContextType<T extends AppConfigArg> =
  T["isEmbeddedApp"] extends true
    ? EmbeddedSessionContext
    : T["isEmbeddedApp"] extends false
    ? NonEmbeddedSessionContext
    : never;
