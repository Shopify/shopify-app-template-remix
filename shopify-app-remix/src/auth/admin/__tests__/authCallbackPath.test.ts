import { shopifyApp } from "../../..";
import {
  SHOPIFY_HOST,
  createTestHmac,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin auth callback", () => {
  describe.only("errors", () => {
    test("throws an error if the shop param is missing", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const url = `${shopify.config.appUrl}/auth/callback`;
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(url)
      );

      // THEN
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Shop param is invalid");
    });

    test("throws an error if the shop param is not valid", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const url = `${shopify.config.appUrl}/auth/callback?shop=invalid`;
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(url)
      );

      // THEN
      expect(response.status).toBe(400);
      expect(await response.text()).toBe("Shop param is invalid");
    });

    test("throws an 302 Response to begin auth if CookieNotFound error", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const callbackUrl = `${shopify.config.appUrl}/auth/callback`;
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${callbackUrl}?shop=${SHOPIFY_HOST}`)
      );

      // THEN
      const { searchParams, hostname } = new URL(
        response.headers.get("location")!
      );

      expect(response.status).toBe(302);
      expect(hostname).toBe(SHOPIFY_HOST);
      expect(searchParams.get("client_id")).toBe(config.apiKey);
      expect(searchParams.get("scope")).toBe(config.scopes!.toString());
      expect(searchParams.get("redirect_uri")).toBe(callbackUrl);
      expect(searchParams.get("state")).toStrictEqual(expect.any(String));
    });

    test("throws a 400 if InvalidOAuthError error", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const cookieName = "shopify_app_state";
      const state = "nonce";
      const signedState = createTestHmac(config.apiSecretKey, state);
      const callbackUrl = `${shopify.config.appUrl}/auth/callback`;
      const code = "code_from_shopify";
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${callbackUrl}?shop=${SHOPIFY_HOST}&state=${state}&code=${code}`,
          {
            headers: {
              Cookie: [
                `${cookieName}=${state}`,
                `${cookieName}.sig=${signedState}`,
              ].join(";"),
            },
          }
        )
      );

      // THEN
      expect(response.status).toBe(400);
      expect(response.statusText).toBe("Invalid OAuth Request");
    });

    test("throws an 500 Response if the Request HMAC is invalid", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const cookieName = "shopify_app_state";
      const state = "nonce";
      const signedState = createTestHmac(config.apiSecretKey, state);
      const callbackUrl = `${shopify.config.appUrl}/auth/callback`;
      const code = "code_from_shopify";
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${callbackUrl}?shop=${SHOPIFY_HOST}&state=${state}&code=${code}&hmac=invalid`,
          {
            headers: {
              Cookie: [
                `${cookieName}=${state}`,
                `${cookieName}.sig=${signedState}`,
              ].join(";"),
            },
          }
        )
      );

      // THEN
      expect(response.status).toBe(500);
    });
  });

  describe("Success states", () => {
    test("Exchanges the code for a token and saves it to SessionStorage", async () => {
      expect(false).toBe(true);
    });

    test("throws an 302 Response to begin auth if token was offline and useOnlineTokens is true", async () => {
      expect(false).toBe(true);
    });

    test("Runs the afterAuth hook passing the request and session", async () => {
      expect(false).toBe(true);
    });

    test("throws a 302 response to the emebdded app URL if embeded is true", async () => {
      expect(false).toBe(true);
    });

    test("throws a 302 to / if embedded is not true", async () => {
      expect(false).toBe(true);
    });
  });
});
