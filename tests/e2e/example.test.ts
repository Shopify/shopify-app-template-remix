import { test as base, expect } from '@playwright/test';
import { sessionStorage } from '~/shopify.server';
import { Session } from '@shopify/shopify-api';
import dotenv from "dotenv";
import path from "node:path";
import url from "node:url";
import { SignJWT } from "jose";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../test-utilities/test.env")
});


function getHMACKey(key: string) {
  const arrayBuffer = new Uint8Array(key.length);
  for (let i = 0, keyLen = key.length; i < keyLen; i++) {
    arrayBuffer[i] = key.charCodeAt(i);
  }

  return arrayBuffer;
}

/**
 * https://github.com/Shopify/shopify-app-js/blob/7ce48d488a452924cd9ca3ffffab02543a880027/packages/shopify-app-remix/src/server/authenticate/admin/authenticate.ts#L137
 * https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-remix/src/server/authenticate/helpers/validate-session-token.ts#L9
 * https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/lib/session/decode-session-token.ts#L15
 * https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/lib/utils/get-hmac-key.ts
 * https://github.com/panva/jose/blob/HEAD/docs/functions/jwt_verify.jwtVerify.md
 * https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-remix/src/server/authenticate/admin/authenticate.ts#L434
 * https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/lib/session/session-utils.ts#L16
 * https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-remix/src/server/authenticate/admin/authenticate.ts#L454
 */

const test = base.extend<{
  mockShopifyAuthentication: void,
  handleShopifyRedirects: void,
}>({
  mockShopifyAuthentication: [
    async ({ page }, use) => {
    if (
      process.env.SHOPIFY_API_KEY === undefined ||
      process.env.SHOPIFY_API_SECRET === undefined ||
      process.env.SHOPIFY_APP_URL === undefined ||
      process.env.SCOPES === undefined ||
      process.env.TEST_PARALLEL_INDEX === undefined
    ) {
      throw new Error("Test environment variables not set");
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecretKey = process.env.SHOPIFY_API_SECRET;
    const scopes = process.env.SCOPES;
    const appUrl = new URL(process.env.SHOPIFY_APP_URL
        .replace("://", "://" + process.env.TEST_PARALLEL_INDEX));

    sessionStorage.storeSession(new Session({
      id: "offline_" + appUrl.hostname, // online or offline ID
      shop: appUrl.hostname,
      state: "", // OAuth Cookie state
      isOnline: false, // true for online
      scope: scopes, 
      // expires: undefined,
      accessToken: "true",
    }));

    const jwt = await new SignJWT({
        dest: appUrl.toString(),
        sid: apiKey + "0", // Session ID = JWT Audience + JWT Subject
      })
        .setIssuer(new URL("/admin", appUrl).toString())
        .setAudience(apiKey)
        .setSubject("0") // JWT Subject is Merchant staff ID; used for Online Token
        .setExpirationTime("60m")
        .setNotBefore("0m")
        .setIssuedAt()
        .setJti(Math.random().toString(32).slice(2))
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(getHMACKey(apiSecretKey));
    
    await page.setExtraHTTPHeaders({
      origin: appUrl.toString(),
      authorization: "Bearer " + jwt,
    });

    await use();

    sessionStorage.deleteSession("offline_" + appUrl.hostname); // online or offline ID
  }, { auto: true }],

  handleShopifyRedirects: [
    async ({ page, baseURL }, use) => {
    if (
      process.env.SHOPIFY_APP_URL === undefined ||
      process.env.TEST_PARALLEL_INDEX === undefined
    ) {
      throw new Error("Test environment variables not set");
    }

    const appUrl = process.env.SHOPIFY_APP_URL;

    await page.route(baseURL + "/**/*", async route => {
      const response = await route.fetch({ maxRedirects: 0 });
      const responseHeaders = response.headers();
      let redirectHeader = "";

      if (
        response.status() === 204 && // Remix redirect response
        responseHeaders["x-remix-redirect"].includes(appUrl) // wrong redirect URL
      ) {
        redirectHeader = "x-remix-redirect";
      } else if (
        response.status().toString().charAt(0) === "3" && // redirect response
        responseHeaders.location.includes(appUrl) // wrong redirect URL
      ) {
        redirectHeader = "location";
      }

      if (redirectHeader.length > 0) {
        const shopifyLocation = new URL(responseHeaders[redirectHeader]);
        const pathname = shopifyLocation.pathname;
        const location = new URL(pathname, baseURL).toString();
        route.fulfill({
          response,
          headers: {
            ...responseHeaders,
            [redirectHeader]: location,
          },
        });
      } else {
        route.fulfill({ response });
      }
    });

    await use();

  }, { auto: true }],
});

test("Can load", async ({ page }) => {
  await page.goto("/app/");

  const h3Heading = page.getByRole("heading", { level: 3, });
  await expect(h3Heading).toBeVisible();
  await expect(h3Heading).toContainText("Get started with products");
});