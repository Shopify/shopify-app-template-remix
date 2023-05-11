import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  ShopifyRestResources,
  HttpWebhookHandler,
  PubSubWebhookHandler,
  EventBridgeWebhookHandler,
  Shopify,
  Session,
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
  hooks?: HooksConfig;
}

export interface AppConfig<S extends SessionStorage = SessionStorage>
  extends ApiConfig {
  appUrl: string;
  auth: AuthConfig;
  sessionStorage: S;
  useOnlineTokens: boolean;
  hooks: HooksConfig;
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

interface HooksConfig {
  afterAuth?: ({}: AfterAuthOptions) => void | Promise<void>;
}

export interface AfterAuthOptions<R extends ShopifyRestResources = any> {
  session: Session;
  admin: AdminContext<R>;
}

export interface AdminContext<R extends ShopifyRestResources = any> {
  rest: InstanceType<Shopify["clients"]["Rest"]> & R;
  // TODO improve the public API in @shopify/shopify-api GraphQL client
  graphql: InstanceType<Shopify["clients"]["Graphql"]>;
}
