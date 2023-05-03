import { JwtPayload, Session, Shopify } from "@shopify/shopify-api";

export interface AdminContext {
    rest: {
      // TODO: Wrap in functionality to detect failurs and throw Responses
      ...Shopify["clients"]["Rest"];
      // TODO: Use the patched client for the resources as well
      ...restResources
    }
    // TODO improve the public API in @shopify/shopify-api GraphQL client
    // TODO: Wrap in functionality to detect failurs and throw Responses
    graphql: Shopify["clients"]["Graphql"];
}

export interface EmbeddedContext {
  sanitizedHost: string;
  session: {
    // TODO Can we use a different name for this?
    session: Session;
    token: JwtPayload;
  };
  admin: AdminContext;
}

export interface NonEmbeddedContext {
  session: {
    // TODO Can we use a different name for this?
    session: Session;
  };
  admin: AdminContext;
}

export type Context = EmbeddedContext | NonEmbeddedContext;
