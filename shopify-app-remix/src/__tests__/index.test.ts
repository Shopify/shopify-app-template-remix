import fs from "fs";
import path from "path";
import { ShopifyError } from "@shopify/shopify-api";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import * as shopifyApiPackage from "@shopify/shopify-api";

import {
  shopifyApp,
  LATEST_API_VERSION as APP_LATEST_API_VERSION,
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
} from "../index";
import { AppConfigArg } from "../config-types";

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
    // GIVEN
    const config = testConfig({
      userAgentPrefix: "test",
    });

    // WHEN
    const shopify = shopifyApp(config);

    // THEN
    expect(shopify).toBeDefined();
  });

  it("fails with an invalid config", () => {
    expect(() => shopifyApp({} as any)).toThrowError(ShopifyError);
  });

  it("fixes the port if it's not set", () => {
    // GIVEN
    jest.spyOn(shopifyApiPackage, "shopifyApi");
    process.env.PORT = "1234";

    // WHEN
    shopifyApp(testConfig({ appUrl: "http://localhost" }));

    // THEN
    expect(shopifyApiPackage.shopifyApi).toHaveBeenCalledWith(
      expect.objectContaining({
        appUrl: "http://localhost:1234",
      })
    );
  });

  it("applies user agent prefix", () => {
    // GIVEN
    jest.spyOn(shopifyApiPackage, "shopifyApi");
    const config = testConfig({
      userAgentPrefix: "test",
    });

    // WHEN
    shopifyApp(config);

    // THEN
    const { userAgentPrefix } = (shopifyApiPackage.shopifyApi as any).mock
      .calls[1][0];

    expect(userAgentPrefix).toMatch(
      /^test \| Shopify Remix Library v[0-9]+\.[0-9]+\.[0-9]+$/
    );
  });

  it("properly re-exports required @shopify/shopify-api imports", () => {
    // This test doesn't actually test anything, but it's here to make sure that we're actually importing the values
    [APP_LATEST_API_VERSION, LogSeverity, DeliveryMethod, BillingInterval];
  });

  it("defaults sessionStorage", () => {
    // GIVEN
    const config: AppConfigArg = testConfig({ sessionStorage: undefined });
    delete config.sessionStorage;
    delete config.isEmbeddedApp;
    delete config.apiVersion;

    if (fs.existsSync(path.join(__dirname, "../../database.sqlite"))) {
      fs.unlinkSync(path.join(__dirname, "../../database.sqlite"));
    }

    // WHEN
    const shopify = shopifyApp(config);

    // THEN
    expect(shopify.sessionStorage).toBeInstanceOf(SQLiteSessionStorage);
  });
});
