import {
  LogSeverity,
  SESSION_COOKIE_NAME,
  Session,
} from "@shopify/shopify-api";

import { shopifyApp } from "../../..";
import {
  BASE64_HOST,
  GRAPHQL_URL,
  SHOPIFY_HOST,
  TEST_SHOP,
  expectBeginAuthRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from "../../../__tests__/test-helper";
import { mockExternalRequest } from "../../../__tests__/request-mock";
import { signRequestCookie } from "../../../__tests__/test-helper";

describe("authorize.admin doc request path", () => {
  describe("errors", () => {
    it.each([
      { shop: TEST_SHOP, host: undefined },
      { shop: TEST_SHOP, host: "invalid-domain.test" },
      { shop: undefined, host: BASE64_HOST },
      { shop: "invalid", host: BASE64_HOST },
    ])("throws when %s", async ({ shop, host }) => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const searchParams = new URLSearchParams();
      if (shop) searchParams.set("shop", shop);
      if (host) searchParams.set("host", host);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${shopify.config.appUrl}?${searchParams.toString()}`)
      );

      // THEN
      expect(response.status).toBe(400);
    });

    it("redirects to auth when not embedded and there is no offline session", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expectBeginAuthRedirect(shopify.config, response);
    });

    it("redirects to exit-iframe when embedded and there is no offline session", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expect(response.status).toBe(302);

      const { pathname, searchParams } = new URL(
        response.headers.get("location")!,
        shopify.config.appUrl
      );
      expect(pathname).toBe(shopify.config.auth.exitIframePath);
      expect(searchParams.get("shop")).toBe(TEST_SHOP);
      expect(searchParams.get("host")).toBe(BASE64_HOST);
      expect(searchParams.get("exitIframe")).toBe(
        `${shopify.config.auth.path}?shop=${TEST_SHOP}`
      );
    });

    it("redirects to auth when not embedded on an embedded app, and the API token is invalid", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, { method: "POST" }),
        response: new Response(undefined, { status: 401 }),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expectBeginAuthRedirect(shopify.config, response);
    });

    it("returns non-401 codes when not embedded on an embedded app and the request fails", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, { method: "POST" }),
        response: new Response(
          JSON.stringify({ errors: [{ message: "Something went wrong!" }] }),
          { status: 500, statusText: "Internal Server Error" }
        ),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expect(response.status).toBe(500);
      expect(shopify.config.logger.log).toHaveBeenCalledWith(
        LogSeverity.Error,
        expect.stringContaining("Something went wrong!")
      );
    });

    it("returns a 500 when not embedded on an embedded app and the request fails", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, { method: "POST" }),
        response: new Response(
          JSON.stringify({ errors: ["Something went wrong!"] })
        ),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expect(response.status).toBe(500);
      expect(shopify.config.logger.log).toHaveBeenCalledWith(
        LogSeverity.Error,
        expect.stringContaining("Something went wrong!")
      );
    });

    it("redirects to the embedded app URL if there is a valid session but the app isn't embedded yet", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, { method: "POST" }),
        response: new Response(undefined, { status: 200 }),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expect(response.status).toBe(302);

      const { hostname, pathname } = new URL(response.headers.get("location")!);
      expect(hostname).toBe(SHOPIFY_HOST);
      expect(pathname).toBe(`/apps/${shopify.config.apiKey}`);
    });

    it("redirects to the bounce page URL if id_token search param is missing", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`
        )
      );

      // THEN
      expect(response.status).toBe(302);

      const { pathname, searchParams } = new URL(
        response.headers.get("location")!,
        shopify.config.appUrl
      );
      expect(pathname).toBe(shopify.config.auth.patchSessionTokenPath);
      expect(searchParams.get("shop")).toBe(TEST_SHOP);
      expect(searchParams.get("host")).toBe(BASE64_HOST);
      expect(searchParams.get("shopify-reload")).toBe(
        `${shopify.config.appUrl}/?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`
      );
    });

    it("throws a 401 if app is embedded and the id_token search param is invalid", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=invalid`
        )
      );

      // THEN
      expect(response.status).toBe(401);
    });

    it("redirects to exit-iframe if app is embedded and there is no session for the id_token when embedded", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.config.sessionStorage);
      const otherShopDomain = "other-shop.myshopify.io";

      // WHEN
      const { token } = getJwt(
        shopify.config.apiKey,
        shopify.config.apiSecretKey,
        { dest: `https://${otherShopDomain}` }
      );
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
        )
      );

      // THEN
      expect(response.status).toBe(302);

      const { pathname, searchParams } = new URL(
        response.headers.get("location")!,
        shopify.config.appUrl
      );
      expect(pathname).toBe(shopify.config.auth.exitIframePath);
      expect(searchParams.get("shop")).toBe(otherShopDomain);
      expect(searchParams.get("host")).toBe(BASE64_HOST);
      expect(searchParams.get("exitIframe")).toBe(
        `${shopify.config.auth.path}?shop=${otherShopDomain}`
      );
    });

    it("redirects to exit-iframe if app is embedded and the session is no longer valid for the id_token when embedded", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig({ scopes: ["otherTestScope"] }));
      await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const { token } = getJwt(
        shopify.config.apiKey,
        shopify.config.apiSecretKey
      );
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
        )
      );

      // THEN
      expect(response.status).toBe(302);

      const { pathname, searchParams } = new URL(
        response.headers.get("location")!,
        shopify.config.appUrl
      );
      expect(pathname).toBe(shopify.config.auth.exitIframePath);
      expect(searchParams.get("shop")).toBe(TEST_SHOP);
      expect(searchParams.get("host")).toBe(BASE64_HOST);
      expect(searchParams.get("exitIframe")).toBe(
        `${shopify.config.auth.path}?shop=${TEST_SHOP}`
      );
    });

    it("redirects to auth if there is no session cookie for non-embedded apps when at the top level", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig({ isEmbeddedApp: false }));
      await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const request = new Request(
        `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
      );

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      expectBeginAuthRedirect(shopify.config, response);
    });

    it("redirects to auth if there is no session for non-embedded apps when at the top level", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig({ isEmbeddedApp: false }));
      await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const request = new Request(
        `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
      );
      signRequestCookie({
        request,
        cookieName: SESSION_COOKIE_NAME,
        cookieValue: "other-session-id",
        apiSecretKey: shopify.config.apiSecretKey,
      });

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      expectBeginAuthRedirect(shopify.config, response);
    });

    it("redirects to auth if the session is no longer valid for non-embedded apps when at the top level", async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({ isEmbeddedApp: false, scopes: ["otherTestScope"] })
      );
      const session = await setUpValidSession(shopify.config.sessionStorage);

      // WHEN
      const request = new Request(
        `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
      );
      signRequestCookie({
        request,
        cookieName: SESSION_COOKIE_NAME,
        cookieValue: session.id,
        apiSecretKey: shopify.config.apiSecretKey,
      });

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      expectBeginAuthRedirect(shopify.config, response);
    });
  });

  describe.each([true, false])(
    "success cases when isOnline: %s",
    (isOnline) => {
      it("returns the context if the session is valid and the app is embedded", async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({ useOnlineTokens: isOnline }));

        let testSession: Session;
        testSession = await setUpValidSession(shopify.config.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(
            shopify.config.sessionStorage,
            isOnline
          );
        }

        // WHEN
        const { token } = getJwt(
          shopify.config.apiKey,
          shopify.config.apiSecretKey
        );
        const { admin, session } = await shopify.authenticate.admin(
          new Request(
            `${shopify.config.appUrl}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
          )
        );

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(admin.graphql.session).toBe(testSession);
      });

      it("returns the context if the session is valid and the app is not embedded", async () => {
        // GIVEN
        const shopify = shopifyApp({ ...testConfig(), isEmbeddedApp: false });

        let testSession: Session;
        testSession = await setUpValidSession(shopify.config.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(
            shopify.config.sessionStorage,
            isOnline
          );
        }

        // WHEN
        const request = new Request(
          `${shopify.config.appUrl}?shop=${TEST_SHOP}&host=${BASE64_HOST}`
        );
        signRequestCookie({
          request,
          cookieName: SESSION_COOKIE_NAME,
          cookieValue: testSession.id,
          apiSecretKey: shopify.config.apiSecretKey,
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
