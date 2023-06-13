import {
  BillingError,
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
import {
  mockExternalRequest,
  mockExternalRequests,
} from "../../__tests__/request-mock";
import { REAUTH_URL_HEADER, REATH_HEADER } from "../../auth/helpers/redirect-with-app-bridge-headers";

import * as responses from "./mock-responses";

const BILLING_CONFIG: Shopify["config"]["billing"] = {
  [responses.PLAN_1]: {
    amount: 5,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
  },
};

describe("Billing request", () => {
  // TODO: This is currently blocked because the authenticator doesn't work properly with non-embedded apps
  it("redirects to payment confirmation URL when successful and at the top level for non-embedded apps", async () => {
    // GIVEN
    const shopify = shopifyApp({
      ...testConfig(),
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get("Location")).toEqual(
      responses.CONFIRMATION_URL
    );
  });

  it("redirects to exit-iframe with payment confirmation URL when successful using app bridge when embedded", async () => {
    // GIVEN
    const shopify = shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
    });

    const { token } = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
    );

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
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
      responses.CONFIRMATION_URL
    );
  });

  it("returns redirection headers when successful during fetch requests", async () => {
    // GIVEN
    const shopify = shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get(REATH_HEADER)).toEqual("1");
    expect(response.headers.get(REAUTH_URL_HEADER)).toEqual(
      responses.CONFIRMATION_URL
    );
    expect(response.headers.get("Access-Control-Expose-Headers")).toBe(`${REATH_HEADER}, ${REAUTH_URL_HEADER}`)

  });

  it("redirects to authentication when at the top level when Shopify invalidated the session", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
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

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  it("redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session", async () => {
    // GIVEN
    const shopify = shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopify.sessionStorage);

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

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
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
    const shopify = shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopify.sessionStorage);

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

    const { billing } = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(401);

    const reauthUrl = new URL(response.headers.get(REAUTH_URL_HEADER)!);
    expect(reauthUrl.origin).toEqual(APP_URL);
    expect(reauthUrl.pathname).toEqual("/auth");
  });

  it("throws errors other than authentication errors", async () => {
    // GIVEN
    const shopify = shopifyApp({
      ...testConfig(),
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
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

    const { billing } = await shopify.authenticate.admin(request);

    // THEN
    await expect(
      billing.request({ plan: responses.PLAN_1, isTest: true })
    ).rejects.toThrowError(HttpResponseError);
  });

  it("throws a BillingError when the response contains user errors", async () => {
    // GIVEN
    const shopify = shopifyApp({ ...testConfig(), billing: BILLING_CONFIG });
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(
        responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS
      ),
    });

    const { token } = getJwt();
    const { billing } = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
      )
    );

    // THEN
    await expect(
      billing.request({ plan: responses.PLAN_1, isTest: true })
    ).rejects.toThrowError(BillingError);
  });
});
