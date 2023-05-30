import {
  BillingError,
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
import { APP_BRIDGE_REAUTH_HEADER } from "../../auth/helpers/redirect-with-app-bridge-headers";

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
    const config = testConfig();
    const session = await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({
      ...config,
      isEmbeddedApp: false,
      billing: BILLING_CONFIG,
    });

    mockExternalRequests({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
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
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
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
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
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
      responses.CONFIRMATION_URL
    );
  });

  it("returns redirection headers when successful during fetch requests", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.PURCHASE_SUBSCRIPTION_RESPONSE),
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
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get(APP_BRIDGE_REAUTH_HEADER)).toEqual(
      responses.CONFIRMATION_URL
    );
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

    mockExternalRequests({
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
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(302);

    const locationUrl = new URL(response.headers.get("Location")!);
    expect(locationUrl.host).toEqual(TEST_SHOP);
    expect(locationUrl.pathname).toEqual("/admin/oauth/authorize");
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
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
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
      async () => billing.request({ plan: responses.PLAN_1, isTest: true }),
      request
    );

    // THEN
    expect(response.status).toEqual(401);

    const reauthUrl = new URL(response.headers.get(APP_BRIDGE_REAUTH_HEADER)!);
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

    mockExternalRequests({
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
      billing.request({ plan: responses.PLAN_1, isTest: true })
    ).rejects.toThrowError(HttpResponseError);
  });

  it("throws a BillingError when the response contains user errors", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(
        responses.PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS
      ),
    });

    const token = getJwt(
      shopify.config.apiKey,
      shopify.config.apiSecretKey
    ).token;
    const { billing } = await shopify.authenticate.admin(
      new Request(
        `${shopify.config.appUrl}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
      )
    );

    // THEN
    await expect(
      billing.request({ plan: responses.PLAN_1, isTest: true })
    ).rejects.toThrowError(BillingError);
  });
});
