import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  ShopifyRestResources,
  HttpWebhookHandler,
  PubSubWebhookHandler,
  EventBridgeWebhookHandler,
  Shopify,
  Session,
  ApiVersion,
} from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export interface AppConfigArg<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage
> extends Omit<
    ApiConfigArg<Resources>,
    "hostName" | "hostScheme" | "isEmbeddedApp" | "apiVersion"
  > {
  appUrl: string;
  sessionStorage?: Storage;
  useOnlineTokens?: boolean;
  webhooks?: WebhookConfig;
  hooks?: HooksConfig;
  isEmbeddedApp?: boolean;
  apiVersion?: ApiVersion;
  authPathPrefix?: string;
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
  patchSessionTokenPath: string;
}

// TODO: The callbackUrl field should be optional (and eventually removed) in the library
// https://github.com/Shopify/shopify-app-template-remix/issues/31
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

export interface AfterAuthOptions<
  R extends ShopifyRestResources = ShopifyRestResources
> {
  session: Session;
  admin: AdminApiContext<R>;
}

export interface AdminApiContext<
  R extends ShopifyRestResources = ShopifyRestResources
> {
  rest: InstanceType<Shopify["clients"]["Rest"]> & R;
  // TODO: Improve the public API in @shopify/shopify-api GraphQL client
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28352645
  graphql: InstanceType<Shopify["clients"]["Graphql"]>;
}
