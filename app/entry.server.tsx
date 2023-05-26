import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import isbot from "isbot";
import Backend from "i18next-fs-backend";
import { resolve } from "path";
import i18next from "i18next";
import i18nextOptions from "./i18nextOptions";
import i18nextServer from "./i18next.server";
import React from "react";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  // Detect locale from the request
  const lng = await i18nextServer.getLocale(request);

  if (!i18next.isInitialized) {
    await i18next
      .use(initReactI18next)
      .use(ShopifyFormat)
      .use(Backend)
      .init({
        ...i18nextOptions,
        lng, // Initialize with the detected locale
        backend: {
          loadPath: resolve("./public/locales/{{lng}}.json"),
        },
      });
  }
  if (lng !== i18next.language) {
    // Change to the detected locale
    await i18next.changeLanguage(lng);
  }

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
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
