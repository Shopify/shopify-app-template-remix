import {
  HttpResponseError,
  LATEST_API_VERSION,
  SESSION_COOKIE_NAME,
  Session,
} from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";
import { mockExternalRequest } from "../../../__tests__/request-mock";
import { shopifyApp } from "../../..";
import { APP_BRIDGE_REAUTH_HEADER } from "../../../auth/helpers/redirect-with-app-bridge-headers";
import { AdminApiContext } from "../../../config-types";

describe("admin.authenticate context", () => {
  const TEST_CASES = [
    {
      testGroup: "REST client",
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContext, _session: Session) =>
        await admin.rest.get({ path: "/customers.json" }),
    },
    {
      testGroup: "REST resources",
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContext, session: Session) =>
        await admin.rest.Customer.all({ session }),
    },
    {
      testGroup: "GraphQL client",
      mockRequest: mockGraphqlRequest,
      action: async (admin: AdminApiContext, _session: Session) =>
        await admin.graphql.query({ data: "{ shop { name } }" }),
    },
  ];

  describe.each(TEST_CASES)(
    "$testGroup",
    ({ testGroup: _testGroup, mockRequest, action }) => {
      it("redirects to auth when request receives a 401 response and not embedded", async () => {
        // GIVEN
        const { admin, session } = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => await action(admin, session),
          requestMock
        );

        // THEN
        expect(response.status).toEqual(302);

        const { hostname, pathname } = new URL(
          response.headers.get("Location")!
        );
        expect(hostname).toEqual(TEST_SHOP);
        expect(pathname).toEqual("/admin/oauth/authorize");
      });

      it("redirects to auth when request receives a 401 response and not embedded", async () => {
        // GIVEN
        const { admin, session } = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => await action(admin, session),
          requestMock
        );

        // THEN
        expect(response.status).toEqual(302);

        const { hostname, pathname } = new URL(
          response.headers.get("Location")!
        );
        expect(hostname).toEqual(TEST_SHOP);
        expect(pathname).toEqual("/admin/oauth/authorize");
      });

      it("throws when request receives a non-401 response and not embedded", async () => {
        // GIVEN
        const { admin, session } = await setUpNonEmbeddedFlow();
        await mockRequest(500);

        // THEN
        await expect(() => action(admin, session)).rejects.toThrowError(
          HttpResponseError
        );
      });

      it("redirects to exit iframe when request receives a 401 response and embedded", async () => {
        // GIVEN
        const { admin, session } = await setUpEmbeddedFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => await action(admin, session),
          requestMock
        );

        // THEN
        expect(response.status).toEqual(302);

        const { pathname, searchParams } = new URL(
          response.headers.get("Location")!,
          APP_URL
        );

        expect(pathname).toEqual("/auth/exit-iframe");
        expect(searchParams.get("shop")).toEqual(TEST_SHOP);
        expect(searchParams.get("host")).toEqual(BASE64_HOST);
        expect(searchParams.get("exitIframe")).toEqual(
          `/auth?shop=${TEST_SHOP}`
        );
      });

      it("returns app bridge redirection headers when request receives a 401 response on fetch requests", async () => {
        // GIVEN
        const { admin, session } = await setUpFetchFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => await action(admin, session),
          requestMock
        );

        // THEN
        expect(response.status).toEqual(401);

        const { origin, pathname, searchParams } = new URL(
          response.headers.get(APP_BRIDGE_REAUTH_HEADER)!
        );
        expect(origin).toEqual(APP_URL);
        expect(pathname).toEqual("/auth");
        expect(searchParams.get("shop")).toEqual(TEST_SHOP);
      });
    }
  );

  async function setUpEmbeddedFlow() {
    const shopify = shopifyApp({ ...testConfig(), restResources });
    await setUpValidSession(shopify.sessionStorage);

    const { token } = getJwt();
    const request = new Request(
      `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`
    );

    return {
      shopify,
      ...(await shopify.authenticate.admin(request)),
    };
  }

  async function setUpFetchFlow() {
    const shopify = shopifyApp({ ...testConfig(), restResources });
    await setUpValidSession(shopify.sessionStorage);

    const { token } = getJwt();
    const request = new Request(APP_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      shopify,
      ...(await shopify.authenticate.admin(request)),
    };
  }

  async function setUpNonEmbeddedFlow() {
    const shopify = shopifyApp({
      ...testConfig(),
      restResources,
      isEmbeddedApp: false,
    });
    const session = await setUpValidSession(shopify.sessionStorage);

    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    return {
      shopify,
      ...(await shopify.authenticate.admin(request)),
    };
  }

  async function mockRestRequest(status = 401) {
    const requestMock = new Request(
      `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`
    );

    console.log(
      `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`
    );

    await mockExternalRequest({
      request: requestMock,
      response: new Response(undefined, { status }),
    });

    return requestMock;
  }

  async function mockGraphqlRequest(status = 401) {
    const requestMock = new Request(
      `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
      { method: "POST" }
    );
    await mockExternalRequest({
      request: requestMock,
      response: new Response(undefined, { status }),
    });

    return requestMock;
  }
});
