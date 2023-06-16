import { shopifyApp } from "../../..";
import {
  APP_URL,
  TEST_SHOP,
  expectResponseHeaders,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin path session token path", () => {
  test("Uses AppBridge to get a session token if the URL is for auth.patchSessionTokenPath", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth/session-token?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expect(response.status).toBe(200);
    expectResponseHeaders(response);
    expect(response.headers.get("content-type")).toBe(
      "text/html;charset=utf-8"
    );
    expect((await response.text()).trim()).toBe(
      `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`
    );
  });

  test("Uses AppBridge to get a session token if the URL is for auth.patchSessionTokenPath and authPathPrefix is configured", async () => {
    // GIVEN
    const authPathPrefix = "/shopify";
    const config = testConfig({ authPathPrefix });
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}${authPathPrefix}/session-token?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expect(response.status).toBe(200);
    expectResponseHeaders(response);
    expect(response.headers.get("content-type")).toBe(
      "text/html;charset=utf-8"
    );
    expect((await response.text()).trim()).toContain(
      `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`
    );
  });
});
