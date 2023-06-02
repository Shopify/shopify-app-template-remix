import { shopifyApp } from "../../..";
import {
  APP_URL,
  getJwt,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("JWT validation", () => {
  it("returns token when successful", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);
    const { token, payload } = getJwt();

    // WHEN
    const { sessionToken } = await shopify.authenticate.storefront(
      new Request(APP_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    // THEN
    expect(sessionToken).toMatchObject(payload);
  });

  it("throws a 401 on missing Authorization bearer token", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.storefront,
      new Request(APP_URL)
    );

    // THEN
    expect(response.status).toBe(401);
  });

  it("throws a 401 on invalid Authorization bearer token", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.storefront,
      new Request(APP_URL, {
        headers: { Authorization: `Bearer this_is_not_a_valid_token` },
      })
    );

    // THEN
    expect(response.status).toBe(401);
  });

  it("rejects bot requests", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.storefront,
      new Request(APP_URL, {
        headers: { "User-Agent": "Googlebot" },
      })
    );

    // THEN
    expect(response.status).toBe(410);
  });
});
