import { shopifyAppServer } from "../../..";
import {
  APP_URL,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin exit iframe path", () => {
  test("Uses App Bridge to exit iFrame when the url matches auth.exitIframePath", async () => {
    // GIVEN
    const config = testConfig();
    const shopifyServer =  shopifyAppServer(config);

    // WHEN
    const exitTo = encodeURIComponent(config.appUrl);
    const url = `${APP_URL}/auth/exit-iframe?exitIframe=${exitTo}`;
    const response = await getThrownResponse(
      shopifyServer.authenticate.admin,
      new Request(url)
    );

    // THEN
    const responseText = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/html;charset=utf-8"
    );
    expect(responseText).toContain(
      `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`
    );
    expect(responseText).toContain(
      `<script>shopify.redirectTo("${decodeURIComponent(exitTo)}")</script>`
    );
  });

  test("Uses App Bridge to exit iFrame when the url matches auth.exitIframePath and authPathPrefix is passed", async () => {
    // GIVEN
    const authPathPrefix = "/shopify";
    const config = testConfig({ authPathPrefix });
    const shopifyServer =  shopifyAppServer(config);

    // WHEN
    const exitTo = encodeURIComponent(config.appUrl);
    const url = `${APP_URL}${authPathPrefix}/exit-iframe?exitIframe=${exitTo}`;
    const response = await getThrownResponse(
      shopifyServer.authenticate.admin,
      new Request(url)
    );

    // THEN
    const responseText = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/html;charset=utf-8"
    );
    expect(responseText).toContain(
      `<script data-api-key="${config.apiKey}" src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"></script>`
    );
    expect(responseText).toContain(
      `<script>shopify.redirectTo("${decodeURIComponent(exitTo)}")</script>`
    );
  });

  test("Allows relative paths as exitIframe param", async () => {
    // GIVEN
    const shopifyServer =  shopifyAppServer(testConfig());

    // WHEN
    const exitTo = encodeURIComponent("/my-path");
    const url = `${APP_URL}/auth/exit-iframe?exitIframe=${exitTo}`;
    const response = await getThrownResponse(
      shopifyServer.authenticate.admin,
      new Request(url)
    );

    // THEN
    expect(response.status).toBe(200);
  });
});
