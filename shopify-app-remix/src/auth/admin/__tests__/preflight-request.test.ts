import { shopifyApp } from "../../..";
import {
  APP_URL,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";
import { REAUTH_URL_HEADER } from "../../../auth/helpers/add-response-headers";

describe("authorize.admin", () => {
  test("responds to preflight OPTIONS requests", async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, { method: "OPTIONS" })
    );

    // THEN
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Authorization");
    expect(response.headers.get("Access-Control-Expose-Headers")).toBe(REAUTH_URL_HEADER);
  });
});
