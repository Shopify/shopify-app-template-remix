import { BasicParams } from "../../types";

export function addResponseHeadersFactory(params: BasicParams) {
  const {api, config} = params;

  return function addResponseHeaders(request: Request, headers: Headers) {
    const {searchParams} = new URL(request.url);
    const shop = api.utils.sanitizeShop(searchParams.get('shop')!);

    if (config.isEmbeddedApp && shop) {
      headers.append(
        'Content-Security-Policy',
        `frame-ancestors https://${encodeURIComponent(shop)} https://admin.shopify.com;`
      );
    }else {
      headers.append('Content-Security-Policy', `frame-ancestors 'none';`);
    }
  }
}
