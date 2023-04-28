import {
  FeatureDeprecatedError,
  LogSeverity,
  ShopifyError,
} from "@shopify/shopify-api";

import { shopifyApp } from "../index";
import { testConfig } from "./test-helper";
import { SHOPIFY_REMIX_LIBRARY_VERSION } from "../version";

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
    const app = shopifyApp(testConfig);

    expect(app).toBeDefined();
    expect(app.api).toBeDefined();
    expect(app.api.config.apiKey).toBe(testConfig.api.apiKey);
  });

  it("fails with an invalid config", () => {
    expect(() => shopifyApp({} as any)).toThrowError(ShopifyError);
  });

  // TODO: Everything after this point is a copy of shopify-app-express and should be moved into a shared internal package

  it("properly defaults missing configs based on env vars", () => {
    /* eslint-disable no-process-env */
    process.env.SHOPIFY_API_KEY = "envKey";
    process.env.SHOPIFY_API_SECRET = "envSecret";
    process.env.SCOPES = "envScope1,envScope2";
    process.env.SHOPIFY_APP_URL = "https://envhost";
    process.env.SHOP_CUSTOM_DOMAIN = "*.envCustomDomain";

    const shopify = shopifyApp({
      api: {
        logger: testConfig.api.logger,
      },
    });

    expect(shopify).toBeDefined();
    expect(shopify.api.config.apiKey).toEqual("envKey");
    expect(shopify.api.config.apiSecretKey).toEqual("envSecret");
    expect(shopify.api.config.scopes.toString()).toEqual("envScope1,envScope2");
    expect(shopify.api.config.hostName).toEqual("envhost");
    expect(shopify.api.config.hostScheme).toEqual("https");
    expect(shopify.api.config.customShopDomains).toEqual(["*.envCustomDomain"]);
    /* eslint-enable no-process-env */
  });

  it("properly sets the package in log calls", async () => {
    const shopify = shopifyApp(testConfig);

    shopify.config.logger.info("test");

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Info,
      "[shopify-app/INFO] test"
    );

    shopify.config.logger.info("test", { extra: "context" });

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Info,
      "[shopify-app/INFO] test | {extra: context}"
    );
  });

  it("properly logs deprecation messages", async () => {
    const shopify = shopifyApp(testConfig);

    shopify.config.logger.deprecated("9999.0.0", "test");

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      "[shopify-app/WARNING] [Deprecated | 9999.0.0] test"
    );
  });

  it("throws when deprecation version is reached", async () => {
    const shopify = shopifyApp(testConfig);

    expect(() =>
      shopify.config.logger.deprecated(SHOPIFY_REMIX_LIBRARY_VERSION, "test")
    ).toThrow(FeatureDeprecatedError);
  });
});
