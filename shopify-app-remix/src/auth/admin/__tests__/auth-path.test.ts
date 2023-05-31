import { shopifyApp } from "../../..";
import {
  TEST_SHOP,
  expectBeginAuthRedirect,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin auth path", () => {
  test("throws an 400 Response if the shop param is missing", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${shopify.config.appUrl}/auth`;
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
    const url = `${shopify.config.appUrl}/auth?shop=invalid_shop`;
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
    const url = `${shopify.config.appUrl}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    expectBeginAuthRedirect(shopify.config, response);
  });
});
