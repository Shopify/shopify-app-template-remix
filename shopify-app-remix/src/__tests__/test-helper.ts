import crypto from "crypto";

import fetchMock, { MockParams } from "jest-fetch-mock";
import jwt from "jsonwebtoken";
import {
  LATEST_API_VERSION,
  JwtPayload,
  LogSeverity,
} from "@shopify/shopify-api";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

import { AppConfigArg } from "../config-types";

// eslint-disable-next-line import/no-mutable-exports
export function testConfig(
  overrides: Partial<AppConfigArg> = {}
): AppConfigArg {
  return {
    apiKey: "testApiKey",
    apiSecretKey: "testApiSecretKey",
    scopes: ["testScope"],
    apiVersion: LATEST_API_VERSION,
    appUrl: "https://my-test-app.myshopify.io",
    logger: {
      log: jest.fn(),
      level: LogSeverity.Debug,
    },
    isEmbeddedApp: true,
    sessionStorage: new MemorySessionStorage(),
    ...overrides,
  };
}

export const SHOPIFY_HOST = "totally-real-host.myshopify.io";
export const BASE64_HOST = Buffer.from(SHOPIFY_HOST).toString("base64");
export const TEST_SHOP = "test-shop.myshopify.io";

interface TestJwt {
  token: string;
  payload: JwtPayload;
}

export function getJwt(
  apiKey: string,
  apiSecretKey: string,
  overrides: Partial<JwtPayload> = {}
): TestJwt {
  const date = new Date();
  const payload = {
    iss: `${TEST_SHOP}/admin`,
    dest: TEST_SHOP,
    aud: apiKey,
    sub: "12345",
    exp: date.getTime() / 1000 + 3600,
    nbf: date.getTime() / 1000 - 3600,
    iat: date.getTime() / 1000 - 3600,
    jti: "1234567890",
    sid: "0987654321",
    ...overrides,
  };

  const token = jwt.sign(payload, apiSecretKey, {
    algorithm: "HS256",
  });

  return { token, payload };
}

export async function getThrownResponse(
  callback: Function,
  request: Request
): Promise<Response> {
  try {
    await callback(request);
  } catch (response) {
    if (!(response instanceof Response)) {
      throw `${request.method} request to ${request.url} threw an error instead of a response: ${response}`;
    }
    return response;
  }

  throw `${request.method} request to ${request.url} did not throw`;
}

// TODO: Everything after this point is a copy of shopify-app-express and should be moved into a shared internal package
// Not logging as issue. Will be taken care of in: https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=27471073
type MockBody =
  | string
  | {
      [key: string]: any;
    };

export function mockShopifyResponse(body: MockBody, init?: MockParams) {
  fetchMock.mockResponse(
    typeof body === "string" ? body : JSON.stringify(body),
    init
  );
}

export function mockShopifyResponses(
  ...responses: ([MockBody] | [MockBody, MockParams])[]
) {
  const parsedResponses: [string, MockParams][] = responses.map(
    ([body, init]) => {
      const bodyString = typeof body === "string" ? body : JSON.stringify(body);

      return init ? [bodyString, init] : [bodyString, {}];
    }
  );

  fetchMock.mockResponses(...parsedResponses);
}

export function createTestHmac(secretKey: string, body: string): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(body, "utf8")
    .digest("base64");
}
