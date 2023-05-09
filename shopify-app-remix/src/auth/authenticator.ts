import { Authenticator } from "remix-auth";
import { createCookieSessionStorage } from "@remix-run/node";
import { ShopifyRestResources } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

import { AppConfigArg } from "../config-types";
import { BasicParams } from "../types";

import { authStrategyFactory } from ".";
import { Context, SessionContextType } from "./types";

export function authenticatorFactory<
  T extends AppConfigArg<R, S>,
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
>(params: BasicParams) {
  // We won't use this session storage for OAuth because the library handles that internally
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__state",
      secrets: [params.config.apiSecretKey],
      sameSite: "lax",
    },
  });
  const authenticator = new Authenticator<Context<SessionContextType<T>, R>>(
    sessionStorage
  );

  const AuthStrategy = authStrategyFactory<SessionContextType<T>, R>(params);
  authenticator.use(new AuthStrategy(), "shopify-app");

  // TODO Add a billing strategy that takes in a session and exports billing functionality

  // TODO Add a webhook strategy

  return authenticator;
}
