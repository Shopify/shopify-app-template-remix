import {
  ApiVersion,
  HttpResponseError,
  RequestReturn,
  Session,
} from "@shopify/shopify-api";

import { redirectToAuthPage } from "../helpers";
import { BasicParams } from "../../types";

interface QueryVariables {
  [key: string]: any;
}

interface QueryOptions {
  variables?: QueryVariables;
  apiVersion?: ApiVersion;
  headers?: { [key: string]: any };
  tries?: number;
}

export interface GraphqlFunctionOptions {
  params: BasicParams;
  request: Request;
  session: Session;
}
export type GraphqlQueryFunction = <Type = any>(
  query: string,
  options?: QueryOptions
) => Promise<RequestReturn<Type>>;

// TODO: This is actually just a call through to the Shopify API client, but with a different API. We should eventually
// move this over to the library layer. While doing that, we should also allow the apiVersion to be passed into the REST
// client request calls.
export function graphqlClientFactory({
  params,
  request,
  session,
}: GraphqlFunctionOptions) {
  return async function query<Type = any>(
    query: string,
    options?: QueryOptions
  ) {
    const { api, config, logger } = params;

    const client = new api.clients.Graphql({
      session,
      apiVersion: options?.apiVersion,
    });

    try {
      return await client.query<Type>({
        data: { query, variables: options?.variables },
        tries: options?.tries,
        extraHeaders: options?.headers,
      });
    } catch (error) {
      if (error instanceof HttpResponseError) {
        if (error.response.code === 401) {
          throw await redirectToAuthPage(
            { api, config, logger },
            request,
            session.shop
          );
        } else {
          // forward a minimal copy of the upstream HTTP response instead of an Error:
          throw new Response(JSON.stringify(error.response.body), {
            status: error.response.code,
            headers: {
              'Content-Type': error.response.headers!['Content-Type'] as string,
            },
          });
        }
      } else {
        throw error;
      }
    }
  };
}
