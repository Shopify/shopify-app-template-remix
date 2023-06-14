import { shopifyApp } from "../../..";
import { APP_URL, TEST_SHOP, testConfig } from "../../../__tests__/test-helper";

describe("addResponseHeaders", () => {
  it('adds the correct CSP headers when embedded', () => {
    // GIVEN
    const shopify = shopifyApp({
      ...testConfig(),
      isEmbeddedApp: true,
    });
    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
    const headers = new Headers();

    // WHEN
    shopify.addResponseHeaders(request, headers);

    // THEN
    expect(headers.get('Content-Security-Policy')).toEqual(
      `frame-ancestors https://${encodeURIComponent(TEST_SHOP)} https://admin.shopify.com;`
    );
  });

  it('adds the correct CSP headers when not embedded', () => {
    // GIVEN
    const shopify = shopifyApp({
      ...testConfig(),
      isEmbeddedApp: false,
    });
    const request = new Request(APP_URL);
    const headers = new Headers();

    // WHEN
    shopify.addResponseHeaders(request, headers);

    // THEN
    expect(headers.get('Content-Security-Policy')).toEqual(
      `frame-ancestors 'none';`
    );
  });
});
