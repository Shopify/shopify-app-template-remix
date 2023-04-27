import type {
  Headers as ShopifyHeaders,
  AdapterArgs,
  NormalizedResponse,
  NormalizedRequest,
  setAbstractConvertHeadersFunc,
  setAbstractRuntimeString,
  setAbstractConvertRequestFunc,
  setAbstractConvertResponseFunc,
  setAbstractFetchFunc,
  setCrypto,
} from "@shopify/shopify-api/runtime";
import {
  addHeader,
  canonicalizeHeaders,
  flatHeaders,
} from "@shopify/shopify-api/runtime";

interface RemixAdapterArgs extends AdapterArgs {
  rawRequest: Request;
}

export function addAdapter(
  cryptoFn: typeof setCrypto,
  abstractRuntimeString: typeof setAbstractRuntimeString,
  abstractConvertHeadersFunc: typeof setAbstractConvertHeadersFunc,
  abstractConvertRequestFunc: typeof setAbstractConvertRequestFunc,
  abstractConvertResponseFunc: typeof setAbstractConvertResponseFunc,
  abstractFetchFunc: typeof setAbstractFetchFunc
) {
  cryptoFn(crypto as any);

  abstractRuntimeString(() => {
    return `Remix-run`;
  });

  abstractConvertHeadersFunc(
    async (headers: ShopifyHeaders, _adapterArgs: RemixAdapterArgs) => {
      return Promise.resolve(flatHeaders(headers ?? {}));
    }
  );

  abstractConvertRequestFunc(async (adapterArgs: RemixAdapterArgs) => {
    const request = adapterArgs.rawRequest;
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
      addHeader(headers, key, value);
    }

    return {
      headers,
      method: request.method ?? "GET",
      url: new URL(request.url).toString(),
    };
  });

  abstractConvertResponseFunc(
    async (response: NormalizedResponse, _adapterArgs: RemixAdapterArgs) => {
      return new Response(response.body, {
        headers: flatHeaders(response.headers ?? {}),
        status: response.statusCode,
        statusText: response.statusText,
      });
    }
  );

  abstractFetchFunc(
    async ({ headers, method, url, body }: NormalizedRequest) => {
      const resp = await fetch(url, {
        method,
        headers: flatHeaders(headers),
        body,
      });
      const respBody = await resp.text();
      return {
        statusCode: resp.status,
        statusText: resp.statusText,
        body: respBody,
        headers: canonicalizeHeaders(
          Object.fromEntries(resp.headers.entries())
        ),
      };
    }
  );
}
