import React from "react";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import ShopifyFormat from "@shopify/i18next-shopify";
import isbot from "isbot";
import Backend from "i18next-fs-backend";
import i18next from "i18next";
import i18nextOptions from "./utils/i18nextOptions";
import i18nextServer from "./i18next.server";
import {
  loadLocalePolyfills,
  loadPluralRulesPolyfills,
} from "./utils/intlPolyfills";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext
) {
  await loadLocalePolyfills();

  const lng = await i18nextServer.getLocale(request);
  await Promise.all([
    loadPluralRulesPolyfills(i18nextOptions.fallbackLng, lng),
    i18next
      .use(initReactI18next)
      .use(ShopifyFormat)
      .use(Backend)
      .init({
        ...i18nextOptions,
        lng,
      }),
  ]);

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
