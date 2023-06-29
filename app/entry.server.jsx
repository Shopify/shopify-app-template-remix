import React from "react";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import isbot from "isbot";
import Backend from "i18next-fs-backend";
import i18next from "i18next";
import { serverMiddlewares } from "@shopify/shopify-app-remix/i18n";

import i18nextOptions from "./i18nextOptions";
import { shopify } from "./shopify.server";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  _loadContext
) {
  shopify.addResponseHeaders(request, responseHeaders);

  await [
    initReactI18next,
    ...(await serverMiddlewares({
      request,
      options: i18nextOptions,
      backend: Backend,
    })),
  ]
    .reduce((acc, middleware) => acc.use(middleware), i18next)
    .init(i18nextOptions);

  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18next}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
