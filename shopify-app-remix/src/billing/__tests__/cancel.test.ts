import {
  BillingInterval,
  HttpResponseError,
  SESSION_COOKIE_NAME,
  Shopify,
} from "@shopify/shopify-api";

import { shopifyApp } from "../..";
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

describe("Cancel billing", () => {
  it("returns an AppSubscription when the cancellation is successful", async () => {
    // GIVEN
    const shopifyServer =  shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopifyServer.sessionStorage);

    const { billing } = await shopifyServer.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: { Authorization: `Bearer ${getJwt().token}` },
      })
    );

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.CANCEL_RESPONSE),
    });

    // WHEN
    const subscription = await billing.cancel({
      subscriptionId: "123",
      isTest: true,
      prorate: true,
    });

    // THEN
    expect(subscription).toEqual(responses.APP_SUBSCRIPTION);
  });

  it("redirects to authentication when at the top level when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    const shopifyServer =  shopifyApp({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(shopifyServer.sessionStorage);

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const { billing } = await shopifyServer.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        await billing.cancel({
          subscriptionId: "123",
          isTest: true,
          prorate: true,
        }),
      request
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  it("redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session", async () => {
    // GIVEN
    const shopifyServer =  shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopifyServer.sessionStorage);

    const { token } = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
    );

    const { billing } = await shopifyServer.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        await billing.cancel({
          subscriptionId: "123",
          isTest: true,
          prorate: true,
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
    const shopifyServer =  shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopifyServer.sessionStorage);

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const { billing } = await shopifyServer.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(undefined, {
        status: 401,
        statusText: "Unauthorized",
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        await billing.cancel({
          subscriptionId: "123",
          isTest: true,
          prorate: true,
        }),
      request
    );

    // THEN
    expect(response.status).toEqual(401);

    const { origin, pathname } = new URL(
      response.headers.get(APP_BRIDGE_REAUTH_HEADER)!
    );
    expect(origin).toEqual(APP_URL);
    expect(pathname).toEqual("/auth");
  });

  it("throws errors other than authentication errors", async () => {
    // GIVEN
    const shopifyServer =  shopifyApp({
      ...testConfig(),
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(shopifyServer.sessionStorage);

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
      billing.cancel({
        subscriptionId: "123",
        isTest: true,
        prorate: true,
      })
    ).rejects.toThrowError(HttpResponseError);
  });
});
