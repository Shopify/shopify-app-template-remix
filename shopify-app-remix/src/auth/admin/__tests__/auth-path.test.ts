import { shopifyApp } from "../../..";
import {
  APP_URL,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  expectSecurityHeaders,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin auth path", () => {
  test("throws an 400 Response if the shop param is missing", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expect(response.status).toBe(400);
  });

  test("throws an 400 Response if the shop param is invalid", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=invalid_shop`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expect(response.status).toBe(400);
  });

  test("throws an 302 Response to begin auth", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expectBeginAuthRedirect(config, response);
    expectSecurityHeaders(response);
  });

  test('redirects to exit-iframe when loading the auth path while in a fetch request', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url, { headers: { 'Sec-Fetch-Dest': 'empty' } })
    );

    // THEN
    expectExitIframeRedirect(response, { host: null });
  });

  test('redirects to exit-iframe when loading the auth path while in an iframe request', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url, { headers: { 'Sec-Fetch-Dest': 'iframe' } })
    );

    // THEN
    expectExitIframeRedirect(response, { host: null });
  });
});
