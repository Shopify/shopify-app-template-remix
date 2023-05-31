import {
  BillingInterval,
  HttpResponseError,
  SESSION_COOKIE_NAME,
  Shopify,
} from "@shopify/shopify-api";

import { shopifyApp } from "../..";
import {
  BASE64_HOST,
  GRAPHQL_URL,
  TEST_SHOP,
  expectBeginAuthRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from "../../__tests__/test-helper";
import { mockExternalRequest } from "../../__tests__/request-mock";

import * as responses from "./mock-responses";

const BILLING_CONFIG: Shopify["config"]["billing"] = {
  [responses.PLAN_1]: {
    amount: 5,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
  },
};

describe("Billing require", () => {
  it("throws the returned response from onFailure when there is no payment", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EMPTY_SUBSCRIPTIONS),
    });

    const { billing } = await shopify.authenticate.admin(
      new Request(`${shopify.config.appUrl}/billing`, {
        headers: {
          Authorization: `Bearer ${
            getJwt(shopify.config.apiKey, shopify.config.apiSecretKey).token
          }`,
        },
      })
    );

    // WHEN
    try {
      await billing.require({
        plans: [responses.PLAN_1],
        onFailure: async (error) => {
          expect(error.message).toBe("Billing check failed");
          return new Response("Test response", { status: 402 });
        },
      });
    } catch (response) {
      expect(response.status).toBe(402);
      expect(await response.text()).toBe("Test response");
    }
  });

  it("returns true when there is payment", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EXISTING_SUBSCRIPTION),
    });

    const { billing } = await shopify.authenticate.admin(
      new Request(`${shopify.config.appUrl}/billing`, {
        headers: {
          Authorization: `Bearer ${
            getJwt(shopify.config.apiKey, shopify.config.apiSecretKey).token
          }`,
        },
      })
    );

    // WHEN
    const success = await billing.require({
      plans: [responses.PLAN_1],
      onFailure: async () => {
        throw new Error("This should not be called");
      },
    });

    // THEN
    expect(success).toBe(true);
  });

  it("redirects to authentication when at the top level when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    const session = await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const request = new Request(
      `${shopify.config.appUrl}/billing?shop=${TEST_SHOP}`
    );
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
      apiSecretKey: config.apiSecretKey,
    });

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1],
          onFailure: async () => {
            throw new Error("This should not be called");
          },
        }),
      request
    );

    // THEN
    expectBeginAuthRedirect(shopify.config, response);
  });

  it("redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const token = getJwt(
      shopify.config.apiKey,
      shopify.config.apiSecretKey
    ).token;
    const request = new Request(
      `${shopify.config.appUrl}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
    );

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1],
          onFailure: async () => {
            throw new Error("This should not be called");
          },
        }),
      request
    );

    // THEN
    expect(response.status).toEqual(302);

    const locationUrl = new URL(
      response.headers.get("Location")!,
      "http://test.test"
    );
    expect(locationUrl.pathname).toEqual(shopify.config.auth.exitIframePath);
    expect(locationUrl.searchParams.get("shop")).toEqual(TEST_SHOP);
    expect(locationUrl.searchParams.get("host")).toEqual(BASE64_HOST);
    expect(locationUrl.searchParams.get("exitIframe")).toEqual(
      `${shopify.config.auth.path}?shop=${TEST_SHOP}`
    );
  });

  it("returns redirection headers during fetch requests when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const request = new Request(`${shopify.config.appUrl}/billing`, {
      headers: {
        Authorization: `Bearer ${
          getJwt(shopify.config.apiKey, shopify.config.apiSecretKey).token
        }`,
      },
    });

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1],
          onFailure: async () => {
            throw new Error("This should not be called");
          },
        }),
      request
    );

    // THEN
    expect(response.status).toEqual(401);

    const reauthUrl = new URL(
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url")!
    );
    expect(reauthUrl.origin).toEqual(shopify.config.appUrl);
    expect(reauthUrl.pathname).toEqual(shopify.config.auth.path);
  });

  it("throws errors other than authentication errors", async () => {
    // GIVEN
    const config = testConfig();
    const session = await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 500,
        statusText: "Internal Server Error",
      }),
    });

    const request = new Request(
      `${shopify.config.appUrl}/billing?shop=${TEST_SHOP}`
    );
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
      apiSecretKey: config.apiSecretKey,
    });

    const { billing } = await shopify.authenticate.admin(request);

    // THEN
    await expect(
      billing.require({
        plans: [responses.PLAN_1],
        onFailure: async () => {
          throw new Error("This should not be called");
        },
      })
    ).rejects.toThrowError(HttpResponseError);
  });
});
