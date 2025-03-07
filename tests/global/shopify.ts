import { test as base, expect } from "@playwright/test";
import { sessionStorage } from "../../app/shopify.server";
import { Session } from "@shopify/shopify-api";
import dotenv from "dotenv";
import path from "node:path";
import url from "node:url";
import { SignJWT } from "jose";

// Constants
const ENV_FILE_PATH = ".env.testing";
const SESSION_PREFIX = "offline_";
const JWT_EXP_TIME = "60m";
const JWT_ALG = "HS256";
const JWT_TYPE = "JWT";

// Required environment variables
const REQUIRED_ENV_VARS = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SCOPES",
] as const;

// Type for environment config
type EnvConfig = {
  [K in (typeof REQUIRED_ENV_VARS)[number]]: string;
};

// Setup file paths
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize environment configuration
 */
function initializeEnvironment(): EnvConfig {
  // Load environment variables
  dotenv.config({
    path: path.resolve(__dirname, ENV_FILE_PATH),
  });

  // Validate environment variables
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  // Create config object with type safety
  return REQUIRED_ENV_VARS.reduce((config, name) => {
    config[name] = process.env[name]!;
    return config;
  }, {} as EnvConfig);
}

/**
 * Convert string to Uint8Array for HMAC key
 */
function getHMACKey(key: string): Uint8Array {
  const arrayBuffer = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i++) {
    arrayBuffer[i] = key.charCodeAt(i);
  }
  return arrayBuffer;
}

/**
 * Create a Shopify session
 */
function createShopifySession(shop: string, scope: string): Session {
  return new Session({
    id: `${SESSION_PREFIX}${shop}`,
    shop,
    state: "",
    isOnline: false,
    scope,
    accessToken: "true",
  });
}

/**
 * Create a JWT token for Shopify authentication
 */
async function createShopifyJWT(
  appUrl: URL,
  apiKey: string,
  apiSecretKey: string,
): Promise<string> {
  return new SignJWT({
    dest: appUrl.toString(),
    sid: apiKey,
  })
    .setIssuer(new URL("/admin", appUrl).toString())
    .setAudience(apiKey)
    .setExpirationTime(JWT_EXP_TIME)
    .setNotBefore("0m")
    .setIssuedAt()
    .setJti(Math.random().toString(32).slice(2))
    .setProtectedHeader({ alg: JWT_ALG, typ: JWT_TYPE })
    .sign(getHMACKey(apiSecretKey));
}

/**
 * Define the interface for our custom fixtures
 */
interface ShopifyFixtures {
  mockShopifyAuthentication: void;
}

/**
 * Factory function to create the Shopify test instance
 */
function createShopifyTest() {
  // Create and export the extended test object with Shopify fixtures
  return base.extend<ShopifyFixtures>({
    // Mock Shopify authentication
    mockShopifyAuthentication: [
      async ({ page }, use) => {
        const config = initializeEnvironment();

        const appUrl = new URL(config.SHOPIFY_APP_URL.replace("://", "://"));
        const sessionId = `${SESSION_PREFIX}${appUrl.hostname}`;

        try {
          // Store session
          const session = createShopifySession(appUrl.hostname, config.SCOPES);
          await sessionStorage.storeSession(session);

          // Create and set JWT token
          const jwt = await createShopifyJWT(
            appUrl,
            config.SHOPIFY_API_KEY,
            config.SHOPIFY_API_SECRET,
          );

          await page.setExtraHTTPHeaders({
            origin: appUrl.toString(),
            authorization: `Bearer ${jwt}`,
          });
          await use();
        } catch (error) {
          console.error("Error in mockShopifyAuthentication:", error);
          throw error;
        } finally {
          // Cleanup
          await sessionStorage.deleteSession(sessionId);
        }
      },
      { auto: true },
    ],
  });
}

// Create and export the shopify test instance
export const shopifyTest = createShopifyTest();


shopifyTest.beforeEach(async ({ page }) => {
  // Add initialization script to define window.shopify before other scripts run
  await page.addInitScript(SHOPIFY_API_KEY => {
    window.shopify = {
      toast: {
        show: message => message,
        hide: message => message,
      },
      config: {
        apiKey: SHOPIFY_API_KEY || "",
      },
    };
  }, process.env.SHOPIFY_API_KEY);

});
// Re-export expect for convenience
export { expect };
