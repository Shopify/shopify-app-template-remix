import { ShopifyError } from "@shopify/shopify-api";

import { shopifyApp } from "../index";
import { testConfig } from "./test-helper";

describe("shopifyApp", () => {
  /* eslint-disable no-process-env */
  const oldEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });
  /* eslint-enable no-process-env */

  it("can create shopify object", () => {
    // WHEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // THEN
    expect(shopify).toBeDefined();
    expect(shopify.config).toBeDefined();
    expect(shopify.config.apiKey).toBe(config.apiKey);
  });

  it("fails with an invalid config", () => {
    expect(() => shopifyApp({} as any)).toThrowError(ShopifyError);
  });

  it("fixes the port if it's not set", () => {
    // GIVEN
    process.env.PORT = "1234";

    // WHEN
    const config = testConfig({ appUrl: "http://localhost" });
    const shopify = shopifyApp(config);

    // THEN
    expect(shopify.config.appUrl).toBe("http://localhost:1234");
  });

  it("applies user agent prefix", () => {
    // WHEN
    const config = testConfig({
      userAgentPrefix: "test",
    });
    const shopify = shopifyApp(config);

    // THEN
    expect(shopify.config.userAgentPrefix).toMatch(
      /^test \| Shopify Remix Library v[0-9]+\.[0-9]+\.[0-9]+$/
    );
  });
});
