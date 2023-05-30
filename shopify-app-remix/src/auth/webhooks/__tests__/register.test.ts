import { DeliveryMethod, Session } from "@shopify/shopify-api";

import { shopifyApp } from "../../..";
import {
  GRAPHQL_URL,
  TEST_SHOP,
  testConfig,
} from "../../../__tests__/test-helper";

import * as mockResponses from "./mock-responses";
import { mockExternalRequests } from "../../../__tests__/request-mock";

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

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: "POST",
          body: "webhookSubscriptions",
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE)
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: "POST",
          body: "webhookSubscriptionCreate",
        }),
        response: new Response(
          JSON.stringify(mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE)
        ),
      }
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

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: "POST",
          body: "webhookSubscriptions",
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE)
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: "POST",
          body: "webhookSubscriptionCreate",
        }),
        response: new Response(
          JSON.stringify({
            body: mockResponses.HTTP_WEBHOOK_CREATE_ERROR_RESPONSE,
          })
        ),
      }
    );

    // WHEN
    const results = await shopify.registerWebhooks({ session });

    // THEN
    expect(results).toMatchObject({
      NOT_A_VALID_TOPIC: [expect.objectContaining({ success: false })],
    });
  });
});
