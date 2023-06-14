import { BasicParams } from "../../types";
import { APP_BRIDGE_HEADERS } from "./redirect-with-app-bridge-headers";

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

      Object.entries(APP_BRIDGE_HEADERS).forEach(([key, value]) => {
        headers.append(key, value);
      });
    } else {
      headers.append('Content-Security-Policy', `frame-ancestors 'none';`);
    }
  }
}
