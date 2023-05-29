import { shopifyApp } from "../../..";
import {
  SHOPIFY_HOST,
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
    const url = `${shopify.config.appUrl}/auth?shop=${SHOPIFY_HOST}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url)
    );

    // THEN
    const { hostname, pathname, searchParams } = new URL(
      response.headers.get("location")!
    );

    expect(response.status).toBe(302);
    expect(hostname).toBe(SHOPIFY_HOST);
    expect(pathname).toBe("/admin/oauth/authorize");
    expect(searchParams.get("client_id")).toBe(config.apiKey);
    expect(searchParams.get("scope")).toBe(config.scopes!.toString());
    expect(searchParams.get("redirect_uri")).toBe(
      `${config.appUrl}/auth/callback`
    );
    expect(searchParams.get("state")).toStrictEqual(expect.any(String));
  });
});
