import {
  JwtPayload,
  Session,
  ShopifyRestResources,
} from "@shopify/shopify-api";

import type { AdminContext, AppConfigArg } from "../config-types";
import { BillingContext } from "../billing/types";

interface SessionContext {
  // TODO Can we use a different name for this?
  session: Session;
}

export interface EmbeddedSessionContext extends SessionContext {
  token: JwtPayload;
}
export interface NonEmbeddedSessionContext extends SessionContext {}

export interface OAuthContext<
  Config extends AppConfigArg,
  SessionContext extends EmbeddedSessionContext | NonEmbeddedSessionContext,
  Resources extends ShopifyRestResources = any
> {
  session: SessionContext;
  admin: AdminContext<Resources>;
  billing: BillingContext<Config>;
}

export type SessionContextType<T extends AppConfigArg> =
  T["isEmbeddedApp"] extends true
    ? EmbeddedSessionContext
    : T["isEmbeddedApp"] extends false
    ? NonEmbeddedSessionContext
    : never;
