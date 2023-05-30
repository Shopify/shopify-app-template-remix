import { mockExternalRequest } from "../../../__tests__/request-mock";
import { shopifyApp } from "../../..";
import {
  BASE64_HOST,
  TEST_SHOP,
  getThrownResponse,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";
import { HashFormat, createSHA256HMAC } from "@shopify/shopify-api/runtime";

describe("authorize.admin auth callback path", () => {
  describe("errors", () => {
    test("throws an error if the shop param is missing", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(getCallbackUrl(config))
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
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${getCallbackUrl(config)}?shop=invalid`)
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
      const callbackUrl = getCallbackUrl(config);
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${callbackUrl}?shop=${TEST_SHOP}`)
      );

      // THEN
      const { searchParams, hostname } = new URL(
        response.headers.get("location")!
      );

      expect(response.status).toBe(302);
      expect(hostname).toBe(TEST_SHOP);
      expect(searchParams.get("client_id")).toBe(config.apiKey);
      expect(searchParams.get("scope")).toBe(config.scopes!.toString());
      expect(searchParams.get("redirect_uri")).toBe(callbackUrl);
      expect(searchParams.get("state")).toStrictEqual(expect.any(String));
    });

    test("throws a 400 if there is no HMAC param", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const state = "nonce";
      const request = new Request(
        `${getCallbackUrl(config)}?shop=${TEST_SHOP}&state=${state}`
      );

      signRequestCookie({
        request,
        cookieName: "shopify_app_state",
        cookieValue: state,
        apiSecretKey: config.apiSecretKey,
      });

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      expect(response.status).toBe(400);
      expect(response.statusText).toBe("Invalid OAuth Request");
    });

    test("throws a 400 if the HMAC param is invalid", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const state = "nonce";
      const request = new Request(
        `${getCallbackUrl(
          config
        )}?shop=${TEST_SHOP}&state=${state}&hmac=invalid`
      );

      signRequestCookie({
        request,
        cookieName: "shopify_app_state",
        cookieValue: state,
        apiSecretKey: config.apiSecretKey,
      });

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      expect(response.status).toBe(400);
    });
  });

  describe("Success states", () => {
    test("Exchanges the code for a token and saves it to SessionStorage", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest("offline");
      await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      const [session] = await config.sessionStorage!.findSessionsByShop(
        TEST_SHOP
      );

      expect(session).toMatchObject({
        accessToken: "123abc",
        id: `offline_${TEST_SHOP}`,
        isOnline: false,
        scope: "read_products",
        shop: TEST_SHOP,
        state: "nonce",
      });
    });

    test("throws an 302 Response to begin auth if token was offline and useOnlineTokens is true", async () => {
      // GIVEN
      const config = testConfig({ useOnlineTokens: true });
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest("offline");
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      const { searchParams, hostname } = new URL(
        response.headers.get("location")!
      );

      expect(response.status).toBe(302);
      expect(hostname).toBe(TEST_SHOP);
      expect(searchParams.get("client_id")).toBe(config.apiKey);
      expect(searchParams.get("scope")).toBe(config.scopes!.toString());
      expect(searchParams.get("redirect_uri")).toBe(getCallbackUrl(config));
      expect(searchParams.get("state")).toStrictEqual(expect.any(String));
    });

    test("Does not throw a 302 Response to begin auth if token was online", async () => {
      // GIVEN
      const config = testConfig({ useOnlineTokens: true });
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest("online");
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      const { hostname } = new URL(response.headers.get("location")!);
      expect(hostname).not.toBe(TEST_SHOP);
    });

    test("Runs the afterAuth hooks passing", async () => {
      // GIVEN
      const afterAuthMock = jest.fn();
      const config = testConfig({
        hooks: {
          afterAuth: afterAuthMock,
        },
      });
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest();
      await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      expect(afterAuthMock).toHaveBeenCalledTimes(1);
    });

    test("throws a 302 response to the emebdded app URL if isEmbeddedApp is true", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest("offline");
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe(
        "https://totally-real-host.myshopify.io/apps/testApiKey"
      );
    });

    test("throws a 302 to / if embedded is not true", async () => {
      // GIVEN
      const config = testConfig({
        isEmbeddedApp: false,
      });
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest("offline");
      const request = await getValidCallbackRequest(config);
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request
      );

      // THEN
      const url = new URL(request.url);
      const host = url.searchParams.get("host");
      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe(
        `/?shop=${TEST_SHOP}&host=${host}`
      );
      expect(response.headers.get("set-cookie")).toBe(
        [
          "shopify_app_state=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT",
          `shopify_app_session=offline_${TEST_SHOP};sameSite=lax; secure=true; path=/`,
          "shopify_app_session.sig=lOkBnaRYxL39cF4QYycrnwFwS5F9aeUHm/jTNY3qbTE=;sameSite=lax; secure=true; path=/",
        ].join(", ")
      );
    });
  });
});

function getCallbackUrl(appConfig: ReturnType<typeof testConfig>) {
  return `${appConfig.appUrl}/auth/callback`;
}

async function getValidCallbackRequest(config: ReturnType<typeof testConfig>) {
  const cookieName = "shopify_app_state";
  const state = "nonce";
  const code = "code_from_shopify";
  const now = Math.trunc(Date.now() / 1000) - 2;
  const queryParams = `code=${code}&host=${BASE64_HOST}&shop=${TEST_SHOP}&state=${state}&timestamp=${now}`;
  const hmac = await createSHA256HMAC(
    config.apiSecretKey,
    queryParams,
    HashFormat.Hex
  );

  const request = new Request(
    `${getCallbackUrl(config)}?${queryParams}&hmac=${hmac}`
  );

  signRequestCookie({
    request,
    cookieName,
    cookieValue: state,
    apiSecretKey: config.apiSecretKey,
  });

  return request;
}

function mockCodeExchangeRequest(tokenType: "online" | "offline" = "offline") {
  const responseBody = {
    access_token: "123abc",
    scope: "read_products",
  };

  mockExternalRequest({
    request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
      method: "POST",
    }),
    response:
      tokenType === "offline"
        ? new Response(JSON.stringify(responseBody))
        : new Response(
            JSON.stringify({
              ...responseBody,
              expires_in: Math.trunc(Date.now() / 1000) + 3600,
              associated_user_scope: "read_products",
              associated_user: {
                id: 902541635,
                first_name: "John",
                last_name: "Smith",
                email: "john@example.com",
                email_verified: true,
                account_owner: true,
                locale: "en",
                collaborator: false,
              },
            })
          ),
  });
}
