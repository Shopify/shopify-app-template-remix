import { redirect } from "@remix-run/server-runtime";

import { BasicParams } from "../types";

export function redirectOutOfApp(
  params: BasicParams,
  request: Request,
  url: string
): Response {
  const { config, logger } = params;

  logger.debug("Redirecting out of app", { url });

  const requestUrl = new URL(request.url);
  const isEmbeddedRequest = requestUrl.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");

  // TODO This is similar but not exactly like some code in the oauth strategy - is it worth extracting into a helper?
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28374220
  if (isXhrRequest) {
    // TODO Check this with the beta flag disabled (with the bounce page)
    // Remix is not including the X-Shopify-API-Request-Failure-Reauthorize-Url when throwing a 401 Response
    // https://github.com/remix-run/remix/issues/5356
    throw new Response(undefined, {
      status: 401,
      statusText: "Unauthorized",
      headers: {
        "X-Shopify-API-Request-Failure-Reauthorize-Url": url,
      },
    });
  } else if (isEmbeddedRequest) {
    const params = new URLSearchParams({
      shop: requestUrl.searchParams.get("shop")!,
      host: requestUrl.searchParams.get("host")!,
      exitIframe: url,
    });

    return redirect(`${config.auth.exitIframePath}?${params.toString()}`);
  } else {
    return redirect(url);
  }
}
