import {
  DeleteRequestParams,
  GetRequestParams,
  PostRequestParams,
  PutRequestParams,
  RequestParams,
  Session,
  Shopify,
  ShopifyRestResources
} from "@shopify/shopify-api";

import { BasicParams } from "../../types";
import { handleClientError } from "../helpers";

interface RestClientOptions {
  params: BasicParams;
  request: Request;
  session: Session;
}

export class RemixRestClient<Resources extends ShopifyRestResources> {
  public session: Session;
  public resources: Resources;
  private params: BasicParams;
  private request: Request;

  constructor({
    params,
    request,
    session,
  }: RestClientOptions) {
    this.params = params;
    this.request = request;
    this.session = session;
  }

  protected async makeRequest(params: RequestParams): Promise<Response> {
    const originalClient = new this.params.api.clients.Rest({ session: this.session });
    const originalRequest = Reflect.get(originalClient, "request");

    try {
      const apiResponse = await originalRequest.call(originalClient, params);

      // We use a separate client for REST requests and REST resources because we want to override the API library
      // client class to return a Response object instead.
      return new Response(
        JSON.stringify(apiResponse.body),
        { headers: apiResponse.headers }
      );
    } catch (error) {
      throw await handleClientError({
        params: this.params,
        request: this.request,
        shop: this.session.shop,
        error,
      });
    }
  }

  /**
   * Performs a GET request on the given path.
   */
  public async get(params: GetRequestParams) {
    return this.makeRequest({
      method: "GET" as RequestParams['method'],
      ...params
    });
  }

  /**
   * Performs a POST request on the given path.
   */
  public async post(params: PostRequestParams) {
    return this.makeRequest({
      method: "POST" as RequestParams['method'],
      ...params
    });
  }

  /**
   * Performs a PUT request on the given path.
   */
  public async put(params: PutRequestParams) {
    return this.makeRequest({
      method: "PUT" as RequestParams['method'],
      ...params
    });
  }

  /**
   * Performs a DELETE request on the given path.
   */
  public async delete(params: DeleteRequestParams) {
    return this.makeRequest({
      method: "DELETE" as RequestParams['method'],
      ...params
    });
  }
}

export function restResourceClientFactory({ params, request, session }: RestClientOptions): Shopify["clients"]["Rest"] {
  const { api, config, logger } = params;

  const ApiClient = api.clients.Rest;
  return class RestResourceClient extends ApiClient {
    protected async request(params: RequestParams) {
      const originalClient = new api.clients.Rest({ session });
      const originalRequest = Reflect.get(originalClient, "request");

      try {
        // We just call through to the API library client, and handle the error response here, so that data parsing
        // behaves the same way.
        return await originalRequest.call(originalClient, params);
      } catch (error) {
        throw await handleClientError({
          params: { api, config, logger },
          request,
          shop: session.shop,
          error,
        });
      }
    }
  }
}
