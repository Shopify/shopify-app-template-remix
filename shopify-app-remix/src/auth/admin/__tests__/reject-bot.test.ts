import { shopifyApp } from "../../..";
import {
  APP_URL,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin", () => {
  test("rejects bot requests", async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {
        headers: {
          "User-Agent": "Googlebot",
        },
      })
    );

    // THEN
    expect(response.status).toBe(410);
    expect(response.statusText).toBe("Gone");
  });
});
