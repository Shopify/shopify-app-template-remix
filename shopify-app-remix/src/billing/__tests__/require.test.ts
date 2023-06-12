import {
  BillingInterval,
  HttpResponseError,
  SESSION_COOKIE_NAME,
  Shopify,
} from "@shopify/shopify-api";

import { shopifyAppServer } from "../..";
import {
  APP_URL,
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
import { APP_BRIDGE_REAUTH_HEADER } from "../../auth/helpers/redirect-with-app-bridge-headers";

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
    const shopifyServer =  shopifyAppServer({ ...config, billing: BILLING_CONFIG });

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EMPTY_SUBSCRIPTIONS),
    });

    const { billing } = await shopifyServer.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${getJwt().token}`,
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
    const shopifyServer =  shopifyAppServer({ ...config, billing: BILLING_CONFIG });

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EXISTING_SUBSCRIPTION),
    });

    const { billing } = await shopifyServer.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${getJwt().token}`,
        },
      })
    );

    // WHEN
    const result = await billing.require({
      plans: [responses.PLAN_1],
      onFailure: async () => {
        throw new Error("This should not be called");
      },
    });

    // THEN
    expect(result.hasActivePayment).toBe(true);
    expect(result.oneTimePurchases).toEqual([]);
    expect(result.appSubscriptions).toEqual([
      { id: "gid://123", name: responses.PLAN_1, test: true },
    ]);
  });

  it("redirects to authentication when at the top level when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig({
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(config.sessionStorage);
    const shopifyServer =  shopifyAppServer(config);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const { billing } = await shopifyServer.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1 as unknown as never],
          onFailure: async () => {
            throw new Error("This should not be called");
          },
        }),
      request
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  it("redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopifyServer =  shopifyAppServer({ ...config, billing: BILLING_CONFIG });

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const { token } = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
    );

    const { billing } = await shopifyServer.authenticate.admin(request);

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
    expect(locationUrl.pathname).toEqual("/auth/exit-iframe");
    expect(locationUrl.searchParams.get("shop")).toEqual(TEST_SHOP);
    expect(locationUrl.searchParams.get("host")).toEqual(BASE64_HOST);
    expect(locationUrl.searchParams.get("exitIframe")).toEqual(
      `/auth?shop=${TEST_SHOP}`
    );
  });

  it("returns redirection headers during fetch requests when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopifyServer =  shopifyAppServer({ ...config, billing: BILLING_CONFIG });

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const { billing } = await shopifyServer.authenticate.admin(request);

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

    const reauthUrl = new URL(response.headers.get(APP_BRIDGE_REAUTH_HEADER)!);
    expect(reauthUrl.origin).toEqual(APP_URL);
    expect(reauthUrl.pathname).toEqual("/auth");
  });

  it("throws errors other than authentication errors", async () => {
    // GIVEN
    const config = testConfig();
    const session = await setUpValidSession(config.sessionStorage);
    const shopifyServer =  shopifyAppServer({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 500,
        statusText: "Internal Server Error",
      }),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const { billing } = await shopifyServer.authenticate.admin(request);

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
