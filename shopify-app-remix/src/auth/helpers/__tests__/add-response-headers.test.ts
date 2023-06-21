import { shopifyApp } from "../../..";
import { APP_URL, TEST_SHOP, expectSecurityHeaders, testConfig } from "../../../__tests__/test-helper";

describe("addResponseHeaders", () => {
  it.each([true, false])('adds CORS and frame-ancestors CSP headers when embedded = %s', (isEmbeddedApp) => {
    // GIVEN
    const config = {...testConfig(), isEmbeddedApp};
    const shopify = shopifyApp(config);
    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
    const response = new Response();

    // WHEN
    shopify.addResponseHeaders(request, response.headers);

    // THEN
    expectSecurityHeaders(response, isEmbeddedApp);
  });
});
