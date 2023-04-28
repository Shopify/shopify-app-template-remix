import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  ShopifyRestResources,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export interface AppConfigArg<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
> extends Omit<ApiConfigArg<R>, "hostName"> {
  appUrl: string;
  auth?: Partial<AuthConfig>;
  sessionStorage?: S;
}

export interface AppConfig<S extends SessionStorage = SessionStorage>
  extends ApiConfig {
  appUrl: string;
  auth: AuthConfig;
  sessionStorage: S;
}

export interface AuthConfig {
  path: string;
  callbackPath: string;
  sessionTokenPath: string;
}
