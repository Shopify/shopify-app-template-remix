import {
  ApiVersion,
  HttpMaxRetriesError,
  LATEST_API_VERSION,
  SESSION_COOKIE_NAME,
  Session,
} from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from "../../../__tests__/test-helper";
import { mockExternalRequest } from "../../../__tests__/request-mock";
import { shopifyApp } from "../../..";
import { REAUTH_URL_HEADER } from "../../../auth/helpers/add-response-headers";
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
      mockRequest: mockGraphqlRequest(),
      action: async (admin: AdminApiContext, _session: Session) =>
        await admin.graphql("{ shop { name } }"),
    },
    {
      testGroup: "GraphQL client with options",
      mockRequest: mockGraphqlRequest("2021-01" as ApiVersion),
      action: async (admin: AdminApiContext, _session: Session) =>
        await admin.graphql(
          "mutation myMutation($ID: String!) { shop(ID: $ID) { name } }",
          {
            variables: { ID: "123" },
            apiVersion: "2021-01" as ApiVersion,
            headers: { custom: "header" },
            tries: 2,
          }
        ),
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

      it("throws a response when request receives a non-401 response and not embedded", async () => {
        // GIVEN
        const { admin, session } = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest(403);

        // WHEN
        const response = await getThrownResponse(
          async () => await action(admin, session),
          requestMock
        );

        // THEN
        expect(response.status).toEqual(403);
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
        expectExitIframeRedirect(response);
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
        expect(response.headers.get("Access-Control-Expose-Headers")).toBe(REAUTH_URL_HEADER)

        const { origin, pathname, searchParams } = new URL(
          response.headers.get(REAUTH_URL_HEADER)!
        );
        expect(origin).toEqual(APP_URL);
        expect(pathname).toEqual("/auth");
        expect(searchParams.get("shop")).toEqual(TEST_SHOP);
      });
    }
  );

  it("re-throws errors other than HttpResponseErrors on GraphQL requests", async () => {
    // GIVEN
    const { admin } = await setUpEmbeddedFlow();

    // WHEN
    await mockGraphqlRequest()(429);
    await mockGraphqlRequest()(429);

    // THEN
    await expect(async () => admin.graphql(
      "mutation myMutation($ID: String!) { shop(ID: $ID) { name } }",
      { variables: { ID: "123" }, tries: 2 }
    )).rejects.toThrowError(HttpMaxRetriesError);
  });

  it("re-throws errors other than HttpResponseErrors on REST requests", async () => {
    // GIVEN
    const { admin } = await setUpEmbeddedFlow();

    // WHEN
    await mockRestRequest(429);
    await mockRestRequest(429);

    // THEN
    await expect(
      async () => admin.rest.get({ path: "/customers.json", tries: 2 })
    ).rejects.toThrowError(HttpMaxRetriesError);
  });

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


    await mockExternalRequest({
      request: requestMock,
      response: new Response(undefined, { status }),
    });

    return requestMock;
  }

  function mockGraphqlRequest(apiVersion = LATEST_API_VERSION) {
    return async function (status = 401) {
      const requestMock = new Request(
        `https://${TEST_SHOP}/admin/api/${apiVersion}/graphql.json`,
        { method: "POST" }
      );

      await mockExternalRequest({
        request: requestMock,
        response: new Response(undefined, { status }),
      });

      return requestMock;
    };
  }
});
