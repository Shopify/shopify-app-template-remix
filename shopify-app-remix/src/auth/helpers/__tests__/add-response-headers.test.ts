import { shopifyApp } from "../../..";
import { APP_URL, TEST_SHOP, testConfig } from "../../../__tests__/test-helper";
import { REAUTH_URL_HEADER } from "../redirect-with-app-bridge-headers";

describe("addResponseHeaders", () => {
  it('adds CORS and frame-ancestors CSP headers when embedded', () => {
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
    expect(headers.get("Access-Control-Allow-Origin")).toEqual("*");
    expect(headers.get("Access-Control-Allow-Headers")).toEqual("Authorization");
    expect(headers.get("Access-Control-Expose-Headers")).toEqual(REAUTH_URL_HEADER);
  });

  it('adds the frame-ancestors CSP headers to prevent loading in iframes when not embedded', () => {
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
