import { Session } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { shopifyApp } from "../../..";
import {
  TEST_SHOP,
  createTestHmac,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

interface WebhookHeaders {
  [key: string]: string;
  "X-Shopify-Shop-Domain": string;
  "X-Shopify-Topic": string;
  "X-Shopify-API-Version": string;
  "X-Shopify-Webhook-Id": string;
  "X-Shopify-Hmac-Sha256": string;
}

describe("Webhook validation", () => {
  it("returns context when successful", async () => {
    // GIVEN
    const sessionStorage = new MemorySessionStorage();
    const config = testConfig({ sessionStorage, restResources });
    const shopify = shopifyApp(config);

    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: "test",
      accessToken: "totally_real_token",
    });
    await sessionStorage.storeSession(session);

    // WHEN
    const {
      admin,
      apiVersion,
      session: actualSession,
      shop,
      topic,
      webhookId,
    } = await shopify.authenticate.webhook(
      new Request(`${shopify.config.appUrl}/webhooks`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: webhookHeaders(
          shopify.config.apiSecretKey,
          JSON.stringify({})
        ),
      })
    );

    // THEN
    expect(apiVersion).toBe("2023-01");
    expect(shop).toBe(TEST_SHOP);
    expect(topic).toBe("APP_UNINSTALLED");
    expect(webhookId).toBe("1234567890");
    expect(actualSession).toBe(session);

    expect(admin.rest.apiVersion).toBe("2023-01");
    expect(admin.rest.session).toBe(session);

    expect(admin.graphql.apiVersion).toBe("2023-01");
    expect(admin.graphql.session).toBe(session);
  });

  it("throws a 400 on invalid HMAC", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.webhook,
      new Request(`${shopify.config.appUrl}/webhooks`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: webhookHeaders(
          shopify.config.apiSecretKey,
          JSON.stringify({}),
          { "X-Shopify-Hmac-Sha256": "invalid_hmac" }
        ),
      })
    );

    // THEN
    expect(response.status).toBe(400);
  });

  [
    "X-Shopify-Shop-Domain",
    "X-Shopify-Topic",
    "X-Shopify-API-Version",
    "X-Shopify-Webhook-Id",
    "X-Shopify-Hmac-Sha256",
  ].forEach((header) => {
    it(`throws a 400 when header ${header} is missing`, async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.webhook,
        new Request(`${shopify.config.appUrl}/webhooks`, {
          method: "POST",
          body: JSON.stringify({}),
          headers: webhookHeaders(
            shopify.config.apiSecretKey,
            JSON.stringify({}),
            { [header]: "" }
          ),
        })
      );

      // THEN
      expect(response.status).toBe(400);
    });
  });

  it("throws a 404 on missing sessions", async () => {
    // GIVEN
    const sessionStorage = new MemorySessionStorage();
    const config = testConfig({ sessionStorage });
    const shopify = shopifyApp(config);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.webhook,
      new Request(`${shopify.config.appUrl}/webhooks`, {
        method: "POST",
        body: JSON.stringify({}),
        headers: webhookHeaders(
          shopify.config.apiSecretKey,
          JSON.stringify({})
        ),
      })
    );

    // THEN
    expect(response.status).toBe(404);
  });
});

function webhookHeaders(
  apiSecretKey: string,
  body: string,
  overrides: Partial<WebhookHeaders> = {}
): WebhookHeaders {
  return {
    "X-Shopify-Shop-Domain": TEST_SHOP,
    "X-Shopify-Topic": "app/uninstalled",
    "X-Shopify-API-Version": "2023-01",
    "X-Shopify-Webhook-Id": "1234567890",
    "X-Shopify-Hmac-Sha256": createTestHmac(apiSecretKey, body),
    ...overrides,
  };
}
