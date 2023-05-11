import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  ShopifyRestResources,
  HttpWebhookHandler,
  PubSubWebhookHandler,
  EventBridgeWebhookHandler,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export interface AppConfigArg<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage
> extends Omit<ApiConfigArg<R>, "hostName" | "hostScheme"> {
  appUrl: string;
  auth?: Partial<AuthConfig>;
  sessionStorage?: S;
  useOnlineTokens?: boolean;
  webhooks?: WebhookConfig;
}

export interface AppConfig<S extends SessionStorage = SessionStorage>
  extends ApiConfig {
  appUrl: string;
  auth: AuthConfig;
  sessionStorage: S;
  useOnlineTokens: boolean;
}

interface AuthConfig {
  path: string;
  callbackPath: string;
  exitIframePath: string;
  sessionTokenPath: string;
}

// TODO: The callbackUrl field should be optional (and eventually removed) in the library
type TempWebhookHandler =
  | Omit<HttpWebhookHandler, "callback">
  | PubSubWebhookHandler
  | EventBridgeWebhookHandler;

export interface WebhookConfig {
  [key: string]: TempWebhookHandler | TempWebhookHandler[];
}
