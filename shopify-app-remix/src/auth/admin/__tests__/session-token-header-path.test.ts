import { SESSION_COOKIE_NAME, Session } from "@shopify/shopify-api";

import { shopifyApp } from "../../..";
import {
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.session token header path", () => {
  describe("errors", () => {
    it("throws a 401 if the session token is invalid", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
          { headers: { Authorization: "Bearer im-a-valid-token-promise" } }
        )
      );

      // THEN
      expect(response.status).toBe(401);
    });

    [true, false].forEach((isOnline) => {
      it(`returns app bridge redirection headers if there is no session (isOnline: ${isOnline})`, async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({ useOnlineTokens: isOnline }));

        // WHEN
        const { token } = getJwt(
          shopify.config.apiKey,
          shopify.config.apiSecretKey
        );
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(
            `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        // THEN
        expect(response.status).toBe(401);

        const { origin, pathname, searchParams } = new URL(
          response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url")!
        );
        expect(origin).toBe(shopify.config.appUrl);
        expect(pathname).toBe(shopify.config.auth.path);
        expect(searchParams.get("shop")).toBe(TEST_SHOP);
      });

      it(`returns app bridge redirection headers if the session is no longer valid (isOnline: ${isOnline})`, async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({ useOnlineTokens: isOnline, scopes: ["otherTestScope"] })
        );
        await setUpValidSession(shopify.config.sessionStorage, isOnline);

        // WHEN
        const { token } = getJwt(
          shopify.config.apiKey,
          shopify.config.apiSecretKey
        );
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(
            `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        // THEN
        expect(response.status).toBe(401);

        const { origin, pathname, searchParams } = new URL(
          response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url")!
        );
        expect(origin).toBe(shopify.config.appUrl);
        expect(pathname).toBe(shopify.config.auth.path);
        expect(searchParams.get("shop")).toBe(TEST_SHOP);
      });
    });
  });

  describe("success", () => {
    [true, false].forEach((isOnline) => {
      it(`returns context when session exists for embedded apps (isOnline: ${isOnline})`, async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({ useOnlineTokens: isOnline }));

        const testSession = await setUpValidSession(
          shopify.config.sessionStorage,
          isOnline
        );

        // WHEN
        const { token, payload } = getJwt(
          shopify.config.apiKey,
          shopify.config.apiSecretKey
        );
        const { sessionToken, admin, session } =
          await shopify.authenticate.admin(
            new Request(
              `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );

        // THEN
        expect(sessionToken).toEqual(payload);
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(admin.graphql.session).toBe(testSession);
      });

      it(`returns context when session exists for non-embedded apps (isOnline: ${isOnline})`, async () => {
        // GIVEN
        const shopify = shopifyApp({
          ...testConfig(),
          isEmbeddedApp: false,
          useOnlineTokens: isOnline,
        });

        let testSession: Session;
        testSession = await setUpValidSession(shopify.config.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(
            shopify.config.sessionStorage,
            true
          );
        }

        // WHEN
        const request = new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        );
        signRequestCookie({
          request,
          apiSecretKey: shopify.config.apiSecretKey,
          cookieName: SESSION_COOKIE_NAME,
          cookieValue: testSession.id,
        });
        const { admin, session } = await shopify.authenticate.admin(request);

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(admin.graphql.session).toBe(testSession);
      });
    });
  });
});
