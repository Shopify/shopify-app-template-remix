import { HttpResponseError } from "@shopify/shopify-api";

import { BasicParams } from "../../types";

import { redirectToAuthPage } from ".";

interface HandleClientErrorOptions {
  params: BasicParams;
  request: Request;
  error: Error | HttpResponseError;
  shop: string;
}

export async function handleClientError({
  params,
  request,
  error,
  shop,
}: HandleClientErrorOptions): Promise<never> {
  if (error instanceof HttpResponseError) {
    params.logger.debug(`Got an HTTP response error from the API: ${error.message}`, {
      code: error.response.code,
      statusText: error.response.statusText,
      body: JSON.stringify(error.response.body),
    });

    if (error.response.code === 401) {
      throw await redirectToAuthPage(params, request, shop);
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
    params.logger.debug(`Got a response error from the API: ${error.message}`);
    throw error;
  }
}
