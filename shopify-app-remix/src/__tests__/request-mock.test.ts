import {
  mockShopifyRequest,
  mockShopifyRequests,
  skipMockChecks,
  validateMocks,
} from "./request-mock";

describe("Request mocks", () => {
  beforeEach(() => {
    skipMockChecks(true);
  });

  it("can intercept fetch requests", async () => {
    // GIVEN
    mockShopifyRequest({
      request: {
        url: "https://my-example.shopify.io",
        method: "GET",
        headers: { bar: "baz" },
      },
      response: {
        body: { responseFoo: "responseBar" },
        init: { status: 200 },
      },
    });

    // WHEN
    await fetch("https://my-example.shopify.io", {
      method: "GET",
      headers: { bar: "baz" },
    });

    // THEN
    validateMocks();
  });

  it("can intercept multiple requests", async () => {
    // GIVEN
    mockShopifyRequests(
      {
        request: {
          url: "https://my-example.shopify.io",
          method: "GET",
        },
        response: {
          init: { status: 200 },
        },
      },
      {
        request: {
          url: "https://my-example.shopify.io",
          method: "POST",
        },
        response: {
          init: { status: 200 },
        },
      }
    );

    // WHEN
    await fetch("https://my-example.shopify.io", { method: "GET" });
    await fetch("https://my-example.shopify.io", { method: "POST" });

    // THEN
    validateMocks();
  });

  it("detects failures after the first request", async () => {
    // GIVEN
    mockShopifyRequests(
      {
        request: {
          url: "https://my-example.shopify.io",
          method: "GET",
        },
        response: {
          init: { status: 200 },
        },
      },
      {
        request: {
          url: "https://my-example.shopify.io",
          method: "POST",
        },
        response: {
          init: { status: 200 },
        },
      }
    );

    // WHEN
    await fetch("https://my-example.shopify.io", { method: "GET" });
    await fetch("https://my-example.shopify.io", { method: "GET" });

    // THEN
    expect(() => validateMocks()).toThrow(
      "GET request made to https://my-example.shopify.io does not match expectation"
    );
  });

  it("doesn't require the request to be expected", async () => {
    // GIVEN
    mockShopifyRequest({
      response: {
        body: { responseFoo: "responseBar" },
        init: { status: 200 },
      },
    });

    // WHEN
    await fetch("https://my-example.shopify.io", {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: { bar: "baz" },
    });

    // THEN
    validateMocks();
  });

  ["url", "method", "body", "headers"].forEach((field) => {
    it(`can match requests without ${field}`, async () => {
      // GIVEN
      const request = {
        url: "https://my-example.shopify.io",
        method: "POST",
        body: { foo: "bar" },
        headers: { bar: "baz" },
      };

      delete (request as any)[field];
      mockShopifyRequest({
        request,
        response: {
          body: { responseFoo: "responseBar" },
          init: { status: 200 },
        },
      });

      // WHEN
      await fetch("https://my-example.shopify.io", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { bar: "baz" },
      });

      // THEN
      validateMocks();
    });
  });

  it("throws if an expected request isn't made", async () => {
    // GIVEN
    mockShopifyRequest({
      request: {
        url: "https://my-example.shopify.io",
        method: "POST",
        body: { foo: "bar" },
        headers: { bar: "baz" },
      },
      response: {
        body: { responseFoo: "responseBar" },
        init: { status: 200 },
      },
    });

    // THEN
    expect(() => validateMocks()).toThrow(
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
    expect(() => validateMocks()).toThrow("1 unexpected request(s) were made");
  });
});
