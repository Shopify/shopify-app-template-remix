import { shopifyApp } from "../../..";
import {
  getJwt,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("JWT validation", () => {
  it("returns token when successful", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);
    const { token, payload } = getJwt(
      shopify.config.apiKey,
      shopify.config.apiSecretKey
    );

    // WHEN
    const { sessionToken } = await shopify.authenticate.storefront(
      new Request(shopify.config.appUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    // THEN
    expect(sessionToken).toMatchObject(payload);
  });

  it("throws a 401 on missing tokens", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(() =>
      shopify.authenticate.storefront(new Request(shopify.config.appUrl))
    );

    // THEN
    expect(response.status).toBe(401);
  });

  it("throws a 401 on invalid tokens", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(() =>
      shopify.authenticate.storefront(
        new Request(shopify.config.appUrl, {
          headers: { Authorization: `Bearer this_is_not_a_valid_token` },
        })
      )
    );

    // THEN
    expect(response.status).toBe(401);
  });
});
