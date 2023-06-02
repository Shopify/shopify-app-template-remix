import { SESSION_COOKIE_NAME, Session } from "@shopify/shopify-api";

import { shopifyApp } from "../../..";
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";
import { APP_BRIDGE_REAUTH_HEADER } from "../../../auth/helpers/redirect-with-app-bridge-headers";

describe("authorize.session token header path", () => {
  describe("errors", () => {
    it("throws a 401 if the session token is invalid", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
          headers: { Authorization: "Bearer im-a-valid-token-promise" },
        })
      );

      // THEN
      expect(response.status).toBe(401);
    });

    describe.each([true, false])("when isOnline: %s", (isOnline) => {
      it(`returns app bridge redirection headers if there is no session`, async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({ useOnlineTokens: isOnline }));

        // WHEN
        const { token } = getJwt();
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        // THEN
        const { origin, pathname, searchParams } = new URL(
          response.headers.get(APP_BRIDGE_REAUTH_HEADER)!
        );

        expect(response.status).toBe(401);
        expect(origin).toBe(APP_URL);
        expect(pathname).toBe("/auth");
        expect(searchParams.get("shop")).toBe(TEST_SHOP);
      });

      it(`returns app bridge redirection headers if the session is no longer valid`, async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({ useOnlineTokens: isOnline, scopes: ["otherTestScope"] })
        );
        await setUpValidSession(shopify.sessionStorage, isOnline);

        // WHEN
        const { token } = getJwt();
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        // THEN
        expect(response.status).toBe(401);

        const { origin, pathname, searchParams } = new URL(
          response.headers.get(APP_BRIDGE_REAUTH_HEADER)!
        );
        expect(origin).toBe(APP_URL);
        expect(pathname).toBe("/auth");
        expect(searchParams.get("shop")).toBe(TEST_SHOP);
      });
    });
  });

  describe.each([true, false])(
    "success cases when isOnline: %s",
    (isOnline) => {
      it("returns context when session exists for embedded apps", async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({ useOnlineTokens: isOnline }));

        const testSession = await setUpValidSession(
          shopify.sessionStorage,
          isOnline
        );

        // WHEN
        const { token, payload } = getJwt();
        const { sessionToken, admin, session } =
          await shopify.authenticate.admin(
            new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          );

        // THEN
        expect(sessionToken).toEqual(payload);
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(admin.graphql.session).toBe(testSession);
      });

      it("returns context when session exists for non-embedded apps", async () => {
        // GIVEN
        const shopify = shopifyApp({
          ...testConfig(),
          isEmbeddedApp: false,
          useOnlineTokens: isOnline,
        });

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(shopify.sessionStorage, true);
        }

        // WHEN
        const request = new Request(
          `${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        );
        signRequestCookie({
          request,
          cookieName: SESSION_COOKIE_NAME,
          cookieValue: testSession.id,
        });
        const { admin, session } = await shopify.authenticate.admin(request);

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(admin.graphql.session).toBe(testSession);
      });
    }
  );
});
