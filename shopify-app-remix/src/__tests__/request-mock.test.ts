import {
  mockExternalRequest,
  mockExternalRequests,
  skipMockChecks,
  validateMocks,
} from "./request-mock";

describe("Request mocks", () => {
  beforeEach(() => {
    skipMockChecks(true);
  });

  it("can intercept fetch requests", async () => {
    // GIVEN
    await mockExternalRequest({
      request: new Request("https://my-example.shopify.io", {
        headers: { bar: "baz" },
      }),
      response: new Response(JSON.stringify({ responseFoo: "responseBar" }), {
        status: 200,
      }),
    });

    // WHEN
    await fetch("https://my-example.shopify.io", {
      method: "GET",
      headers: { bar: "baz" },
    });

    // THEN
    await validateMocks();
  });

  it("can intercept multiple requests", async () => {
    // GIVEN
    await mockExternalRequests(
      {
        request: new Request("https://my-example.shopify.io"),
        response: new Response(),
      },
      {
        request: new Request("https://my-example.shopify.io", {
          method: "POST",
        }),
        response: new Response(),
      }
    );

    // WHEN
    await fetch("https://my-example.shopify.io", { method: "GET" });
    await fetch("https://my-example.shopify.io", { method: "POST" });

    // THEN
    await validateMocks();
  });

  it("detects failures after the first request", async () => {
    // GIVEN
    await mockExternalRequests(
      {
        request: new Request("https://my-example.shopify.io"),
        response: new Response(),
      },
      {
        request: new Request("https://my-example.shopify.io", {
          method: "POST",
        }),
        response: new Response(),
      }
    );

    // WHEN
    await fetch("https://my-example.shopify.io", { method: "GET" });
    await fetch("https://my-example.shopify.io", { method: "GET" });

    // THEN
    await expect(validateMocks()).rejects.toThrow(
      "GET request made to https://my-example.shopify.io does not match expectation"
    );
  });

  it("matches responses automatically when no request mock is configured", async () => {
    // GIVEN
    await mockExternalRequest({
      response: new Response(JSON.stringify({ responseFoo: "responseBar" })),
    });

    // WHEN
    await fetch("https://my-example.shopify.io", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: { bar: "baz" },
    });

    // THEN
    await validateMocks();
  });

  it("can mock non-200 responses", async () => {
    // GIVEN
    await mockExternalRequest({
      request: new Request("https://my-example.shopify.io"),
      response: new Response(undefined, { status: 500 }),
    });

    // WHEN
    await fetch("https://my-example.shopify.io");

    // THEN
    await validateMocks();
  });

  it.each(["url", "method", "body", "headers"])(
    "can match requests without %s",
    async (field) => {
      // GIVEN
      const request = new Request("https://my-example.shopify.io", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { bar: "baz" },
      });

      delete (request as any)[field];
      await mockExternalRequest({
        request,
        response: new Response(JSON.stringify({ responseFoo: "responseBar" })),
      });

      // WHEN
      await fetch("https://my-example.shopify.io", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { bar: "baz" },
      });

      // THEN
      await validateMocks();
    }
  );

  it("throws if an expected request isn't made", async () => {
    // GIVEN
    await mockExternalRequest({
      request: new Request("https://my-example.shopify.io", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { bar: "baz" },
      }),
      response: new Response(JSON.stringify({ responseFoo: "responseBar" })),
    });

    // THEN
    await expect(validateMocks()).rejects.toThrow(
      "Expected 1 request(s) to be made but they were not"
    );
  });

  it("throws if an unexpected request is made", async () => {
    // WHEN
    await fetch("https://my-example.shopify.io", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: { bar: "baz" },
    });

    // THEN
    await expect(validateMocks()).rejects.toThrow(
      "1 unexpected request(s) were made"
    );
  });
});
