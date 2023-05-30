import { BillingInterval, Shopify } from "@shopify/shopify-api";

import { shopifyApp } from "../..";
import {
  GRAPHQL_URL,
  getJwt,
  setUpValidSession,
  testConfig,
} from "../../__tests__/test-helper";
import { mockExternalRequest } from "../../__tests__/request-mock";

import * as responses from "./mock-responses";

const BILLING_CONFIG: Shopify["config"]["billing"] = {
  [responses.PLAN_1]: {
    amount: 5,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
  },
};

describe("Billing require", () => {
  it("throws the returned response from onFailure when there is no payment", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EMPTY_SUBSCRIPTIONS),
    });

    const { billing } = await shopify.authenticate.admin(
      new Request(`${shopify.config.appUrl}/billing`, {
        headers: {
          Authorization: `Bearer ${
            getJwt(shopify.config.apiKey, shopify.config.apiSecretKey).token
          }`,
        },
      })
    );

    // WHEN
    try {
      await billing.require({
        plans: [responses.PLAN_1],
        onFailure: async (error) => {
          expect(error.message).toBe("Billing check failed");
          return new Response("Test response", { status: 402 });
        },
      });
    } catch (response) {
      expect(response.status).toBe(402);
      expect(await response.text()).toBe("Test response");
    }
  });

  it("returns true when there is payment", async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({ ...config, billing: BILLING_CONFIG });

    mockExternalRequest({
      request: new Request(GRAPHQL_URL, { method: "POST", body: "test" }),
      response: new Response(responses.EXISTING_SUBSCRIPTION),
    });

    const { billing } = await shopify.authenticate.admin(
      new Request(`${shopify.config.appUrl}/billing`, {
        headers: {
          Authorization: `Bearer ${
            getJwt(shopify.config.apiKey, shopify.config.apiSecretKey).token
          }`,
        },
      })
    );

    // WHEN
    const success = await billing.require({
      plans: [responses.PLAN_1],
      onFailure: async () => {
        throw new Error("This should not be called");
      },
    });

    // THEN
    expect(success).toBe(true);
  });
});
