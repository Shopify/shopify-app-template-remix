import { Session } from "@shopify/shopify-api";

import { DeliveryMethod, shopifyApp } from "../../..";
import {
  TEST_SHOP,
  mockShopifyResponses,
  testConfig,
} from "../../../__tests__/test-helper";

import * as mockResponses from "./mock-responses";

describe("Webhook registration", () => {
  it("registers webhooks", async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          PRODUCTS_CREATE: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: "/webhooks",
          },
        },
      })
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: "test",
      accessToken: "totally_real_token",
    });

    mockShopifyResponses(
      [mockResponses.EMPTY_WEBHOOK_RESPONSE],
      [mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE]
    );

    // WHEN
    const results = await shopify.registerWebhooks({ session });

    // THEN
    expect(results).toMatchObject({
      PRODUCTS_CREATE: [expect.objectContaining({ success: true })],
    });
  });

  it("logs when registration fails", async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          NOT_A_VALID_TOPIC: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: "/webhooks",
          },
        },
      })
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: "test",
      accessToken: "totally_real_token",
    });

    mockShopifyResponses(
      [mockResponses.EMPTY_WEBHOOK_RESPONSE],
      [mockResponses.HTTP_WEBHOOK_CREATE_ERROR_RESPONSE]
    );

    // WHEN
    const results = await shopify.registerWebhooks({ session });

    // THEN
    expect(results).toMatchObject({
      NOT_A_VALID_TOPIC: [expect.objectContaining({ success: false })],
    });
  });
});
