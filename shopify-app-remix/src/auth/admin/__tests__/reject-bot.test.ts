import { shopifyAppServer } from "../../..";
import {
  APP_URL,
  getThrownResponse,
  testConfig,
} from "../../../__tests__/test-helper";

describe("authorize.admin", () => {
  test("rejects bot requests", async () => {
    // GIVEN
    const shopifyServer =  shopifyAppServer(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopifyServer.authenticate.admin,
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
