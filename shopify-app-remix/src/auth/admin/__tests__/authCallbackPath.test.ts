import { mockExternalRequest } from "../../../__tests__/request-mock";
import { shopifyApp } from "../../..";
import {
  SHOPIFY_HOST,
  getThrownResponse,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";
import { HashFormat, createSHA256HMAC } from "@shopify/shopify-api/runtime";

describe("authorize.admin auth callback", () => {
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
      const state = "nonce";
      const request = new Request(
        `${getCallbackUrl(config)}?shop=${SHOPIFY_HOST}&state=${state}`
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

    test("throws an 500 Response if the Request HMAC is invalid", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const state = "nonce";
      const request = new Request(
        `${getCallbackUrl(
          config
        )}?shop=${SHOPIFY_HOST}&state=${state}&hmac=invalid`
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
      expect(response.status).toBe(500);
    });
  });

  describe("Success states", () => {
    test("Exchanges the code for a token and saves it to SessionStorage", async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest();
      await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      const [session] = await config.sessionStorage!.findSessionsByShop(
        SHOPIFY_HOST
      );
      expect(session).toMatchObject({
        accessToken: "123abc",
        id: "offline_totally-real-host.myshopify.io",
        isOnline: false,
        scope: "read_products",
        shop: "totally-real-host.myshopify.io",
        state: "nonce",
      });
    });

    test("throws an 302 Response to begin auth if token was offline and useOnlineTokens is true", async () => {
      // GIVEN
      const config = testConfig({ useOnlineTokens: true });
      const shopify = shopifyApp(config);

      // WHEN
      mockCodeExchangeRequest();
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      // THEN
      const { searchParams, hostname } = new URL(
        response.headers.get("location")!
      );

      expect(response.status).toBe(302);
      expect(hostname).toBe(SHOPIFY_HOST);
      expect(searchParams.get("client_id")).toBe(config.apiKey);
      expect(searchParams.get("scope")).toBe(config.scopes!.toString());
      expect(searchParams.get("redirect_uri")).toBe(getCallbackUrl(config));
      expect(searchParams.get("state")).toStrictEqual(expect.any(String));
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
      mockCodeExchangeRequest();
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        await getValidCallbackRequest(config)
      );

      console.log(response.status);

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
      mockCodeExchangeRequest();
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
        `/?shop=${SHOPIFY_HOST}&host=${host}`
      );
      expect(response.headers.get("set-cookie")).toBe(
        [
          "shopify_app_state=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT",
          "shopify_app_session=offline_totally-real-host.myshopify.io;sameSite=lax; secure=true; path=/",
          "shopify_app_session.sig=lmhk8PrLJWONI0Lpx8HrJCpAMfevFb7621vEiW1geHc=;sameSite=lax; secure=true; path=/",
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
  const host = Buffer.from(SHOPIFY_HOST, "utf-8").toString("base64");
  const queryParams = `code=${code}&host=${host}&shop=${SHOPIFY_HOST}&state=${state}&timestamp=${now}`;
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

function mockCodeExchangeRequest() {
  mockExternalRequest({
    request: new Request(`https://${SHOPIFY_HOST}/admin/oauth/access_token`, {
      method: "POST",
    }),
    response: new Response(
      JSON.stringify({
        access_token: "123abc",
        scope: "read_products",
      })
    ),
  });
}
