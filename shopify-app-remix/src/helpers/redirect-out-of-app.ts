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
  if (isXhrRequest) {
    return new Response(undefined, {
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
