import { shopifyApp } from "../../..";
import {
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
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
        expect(
          response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url")
        ).toBe(
          `${shopify.config.appUrl}${shopify.config.auth.path}?shop=${TEST_SHOP}`
        );
      });
    });
  });

  describe("success", () => {
    [true, false].forEach((isOnline) => {
      it(`returns context when session exists (isOnline: ${isOnline})`, async () => {
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
    });
  });
});
