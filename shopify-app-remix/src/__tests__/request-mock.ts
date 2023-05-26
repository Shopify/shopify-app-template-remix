import fetchMock, { MockParams } from "jest-fetch-mock";

type MockBody =
  | string
  | {
      [key: string]: any;
    };

interface MockHeaders {
  [key: string]: string;
}

interface MockExternalRequestArg {
  request?: {
    url?: string;
    method?: string;
    body?: MockBody;
    headers?: MockHeaders;
  };
  response: {
    body?: MockBody;
    init?: MockParams;
  };
}

let REQUEST_MOCKS: MockExternalRequestArg[] = [];

let SKIP_MOCK_CHECKS = false;

export function mockExternalRequest({
  request,
  response,
}: MockExternalRequestArg) {
  REQUEST_MOCKS.push({ request, response });

  fetchMock.mockResponse(
    typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body),
    response.init
  );
}

export function mockExternalRequests(...mocks: MockExternalRequestArg[]) {
  const parsedResponses: [string, MockParams][] = mocks.map(
    ({ request, response }) => {
      REQUEST_MOCKS.push({ request, response });

      const bodyString =
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body);

      return response.init ? [bodyString, response.init] : [bodyString, {}];
    }
  );

  fetchMock.mockResponses(...parsedResponses);
}

export function validateMocks() {
  if (REQUEST_MOCKS.length === 0 && fetchMock.mock.calls.length === 0) {
    return;
  }

  let matchedRequests: number = 0;
  REQUEST_MOCKS.forEach(({ request }, index) => {
    if (fetchMock.mock.calls.length === 0) {
      return true;
    }

    matchedRequests++;
    const [url, init] = fetchMock.mock.calls[index];

    const method = init?.method ?? "GET";
    let body = init?.body as string;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init?.body);
      } catch (error) {
        // Not JSON, that's fine
      }
    }

    const expected: { [key: string]: any } = {};
    const actual: { [key: string]: any } = {};

    if (request?.url) {
      expected.url = request.url;
      actual.url = url;
    }

    if (request?.method) {
      expected.method = request.method;
      actual.method = method;
    }

    if (request?.body) {
      expected.body = request.body;
      actual.body = body;
    }

    if (request?.headers) {
      expected.headers = {};
      actual.headers = {};
      Object.entries(request.headers).forEach(([key, value]) => {
        expected.headers[key] = value;
        actual.headers[key] = (init?.headers as any)[key];
      });
    }

    try {
      expect(actual).toEqual(expected);
    } catch (error) {
      error.message = `${method} request made to ${url} does not match expectation:\n\n${error.message}`;
      throw error;
    }
  });

  if (REQUEST_MOCKS.length > matchedRequests) {
    throw new Error(
      `Expected ${
        REQUEST_MOCKS.length
      } request(s) to be made but they were not:\n\n${JSON.stringify(
        REQUEST_MOCKS,
        null,
        2
      )}`
    );
  }

  if (fetchMock.mock.calls.length > matchedRequests) {
    throw new Error(
      `${
        fetchMock.mock.calls.length
      } unexpected request(s) were made, make sure to mock all expected requests:\n\n${JSON.stringify(
        fetchMock.mock.calls,
        null,
        2
      )}`
    );
  }
}

export function skipMockChecks(value: boolean) {
  SKIP_MOCK_CHECKS = value;
}

beforeEach(() => {
  SKIP_MOCK_CHECKS = false;
  REQUEST_MOCKS = [];
  fetchMock.resetMocks();
});

afterEach(() => {
  if (!SKIP_MOCK_CHECKS) {
    validateMocks();
  }
});
