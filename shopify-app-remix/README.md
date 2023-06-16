# `@shopify/shopify-app-remix`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-express.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-express)

This package makes it easy to use [Remix](https://remix.run/) to build Shopify apps.
It builds on the `@shopify/shopify-api` package and exposes a `shopifyApp` function. You can use `shopifyApp` to configure your app and then authenticate requests from Shopify.

## Requirements

To follow these usage guides, you will need to:

- have a Shopify Partner account and development store
- have an app already set up on your partner account
- have a JavaScript package manager such as [yarn](https://yarnpkg.com) installed

## Getting started

This package works with any Remix app. If you're starting an app from scratch, you can create a brand new Remix app that uses the indie-stack:

```bash
npx create-remix@latest --template remix-run/indie-stack
cd ./name-of-your-app
```

Now let's install this package:

```bash
npm install @shopify/shopify-app-remix
```

Create `app/shopify.server.js`. We will use this file to configure our Shopify app:

```ts
// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ["read_products"],
  apiVersion: LATEST_API_VERSION,
});
```

A description of these config options:

| option        | description                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey        | The Client ID for your app. Copy it from your app in the Shopify partners dashboard. This is public.                                                           |
| apiSecretKey  | The API Secret for your app. Copy it from your app in the Shopify partners dashboard. This is private. Do not commit this.                                     |
| appUrl        | This is the URL for your app.                                                                                                                                  |
| scopes        | What permissions your app needs. [More information](https://shopify.dev/docs/api/usage/access-scopes).                                                         |
| apiVersion    | What versions of the [Admin API's](https://shopify.dev/docs/api/) do you want to use. If you are creating anew app use LATEST_API_VERSION.                     |
| restResources | What version of the [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest) do you want to use. If you are creating anew app use LATEST_API_VERSION. |

This will require some environment variables. So let's create an `.env` file:

```env
SHOPIFY_API_KEY="[Copy from partners dashboard]"
SHOPIFY_API_SECRET="[Copy from partners dashboard]"
SHOPIFY_APP_URL="[The tunnel URL you are using to run your app]"
```

`shopifyApp` needs to reserve a [splat route](https://remix.run/docs/en/main/guides/routing#splats). The default is `apps/routes/auth/$.tsx`, but you can configure this route using the `authPathPrefix option`:

```ts
// app/shopify.server.js
import { shopifyApp } from "@shopify/shopify-app-remix";

export const shopify = shopifyApp({
  // ...
  authPathPrefix: "/auth",
});
```

Now let's create the [splat route](https://remix.run/docs/en/main/guides/routing#splats) for auth. It should export a loader that uses `shopifyApp` to authenticate:

```ts
// app/routes/auth/$.tsx
import { LoaderArgs } from "@remix-run/node";

import { shopify } from "../../shopify.server";

export async function loader({ request }: LoaderArgs) {
  return shopify.authenticate.admin(request);
}
```

Finally if your app is embedded (this is the default) we need to setup [App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) in `root.tsx.`.  To do this pass the `process.env.SHOPIFY_API_KEY` to the frontend via the loader and load App Bridge from the CDN in the document head.

Here is an example:

```ts
// root.tsx
export async function loader() {
  return json({
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <Meta />
        <Links />
        {/* App Bridge must be loaded from the CDN at the head */}
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge-next/app-bridge.js"
          data-api-key={apiKey}
        />
      </head>
      <body>
        //
      </body>
    </html>
  );
}
```

> **Note**: This version of App Bridge must be loaded from the CDN, in the document head.

Now that your app is ready to respond to requests, it will also need to add the required `Content-Security-Policy` header directives, as per [our documentation](https://shopify.dev/docs/apps/store/security/iframe-protection).
To do that, this package provides the `shopify.addResponseHeaders` method.

You should return these headers from any endpoint that renders HTML in your app.
You can do that by using that method in individual loaders when returning a `Response`, or globally by adding it to your `entry.server.tsx` file:

```ts
// entry.server.tsx
import { shopify } from "~/shopify.server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");
  shopify.addResponseHeaders(request, responseHeaders);

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
```

## Setting up for your runtime

By default, this package will work with the runtimes supported by [Remix adapters](https://remix.run/docs/en/1.17.1/other-api/adapter#official-adapters) because it relies on the same [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

Since Node.js doesn't fully implement that API, apps will need to import an extra adapter to set it up before using this package's exports.

In the [Getting Started](#getting-started) section above, you'll notice that the example runs
```ts
import "@shopify/shopify-app-remix/adapters/node"
```
before calling `shopifyApp`.
If you're running on a runtime other than Node, you can simply omit that line.

## Loading your app in admin

To load your app within the Shopify Admin, you need to:

1. Update your app's URL in your Partners Dashboard app setup page to `http://localhost:8080`
1. Update your app's callback URL to `http://localhost:8080/api/auth/callback` in that same page
1. Go to **Test your app** in Partners Dashboard and select your development store

## Authenticating admin requests

`shopifyApp` provides methods for authenticating admin requests. To authenticate admin requests you can call `shopify.authenticate.admin(request)` in a loader or an action:

```ts
// app/routes/**/*.tsx
export const loader = async ({ request }: LoaderArgs) => {
  await shopify.authenticate.admin(request);

  return null;
};
```

If there is a session for this user, this loader will return null. If there is no session for the user, the loader will throw the appropriate redirect Response.

### Using the Shopify admin GraphQL API

To access the [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql) pass a request from a loader or an action to `shopify.authenticate.admin`. This will either redirect the merchant to install your app or it will give you access to API functions. E.g:

```ts
// routes/**/*.tsx
import { shopify } from "../shopify.server";
import { ActionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  const { admin } = await shopify.authenticate.admin(request);

  await admin.graphql(
    `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }`,
    {
      variables: {
        input: {
          title: "New product",
          variants: [{ price: 100 }],
        },
      },
    }
  );

  return null;
}
```

### Using the Shopify admin REST API

`shopify.authenticate.admin` can returns methods for interacting with [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest). To access the [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest) first configure `shopifyApp` with the REST resources you would like to use:

```ts
// app/routes/**/*.tsx
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

export const shopify = shopifyApp({
  restResources,
  // ...etc
});
```

Next pass a request to `shopify.authenticate.admin` in a loader or an action. This will either redirect the merchant to install your app or it will give you access to API functions. E.g:

```ts
// app/routes/**/*.tsx
export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);
  const data = await admin.rest.Product.count({ session });

  return json(data);
};
```

## Authenticating webhook requests

Your app must respond to [mandatory webhook topics](https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks). In addition, your app can register [optional webhook topics](https://shopify.dev/docs/api/admin-rest/2023-04/resources/webhook#event-topics).

To setup webhooks first we need to configure `shopifyApp` with 2 pieces:

1. The webhooks you want to subscribe to. In this example we subscribe to the `APP_UNINSTALLED` topic.
2. The code to register the `APP_UNINSTALLED` topic after a merchant installs you app. Here `shopifyApp` provides an `afterAuth` hook.

```ts
// shopify.server.js
import { shopifyApp, DeliveryMethod } from "@shopify/shopify-app-remix";

export const shopify = shopifyApp({
  apiKey: "1707326264fde5037c658n120626ce3f",
  // ...etc
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
});
```

Next you must add a route for each `callbackUrl` you pass. It should use the `shopify.authenticate.webhook` function to authenticate the request. For example:

To do this, your app must authenticate the request.

```ts
// routes/webhooks.tsx
import { ActionArgs } from "@remix-run/node";

import { shopify } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionArgs) => {
  const { topic, shop } = await shopify.authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await db.session.deleteMany({ where: { shop } });
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
```

## Authenticating storefront requests

Your Remix app may need to authenticate requests coming from a storefront context. Here is how:

```ts
// e.g: routes/api/storefront.tsx
import { shopify } from "../shopify.server";
import { LoaderArgs, json } from "@remix-run/node";
import { getNotes } from "~/models/notes";

export const loader = async ({ request }: LoaderArgs) => {
  const { sessionToken } = await shopify.authenticate.storefront(request);

  // E.g: Get notes using the shops admin domain
  return json(await getNotes(sessionToken.iss));
};
```

This can be useful if your app exposes checkout or theme extensions and those extensions need to access data from your app.

## Session Storage

By default `shopifyApp` uses [@shopify/shopify-app-session-storage-sqlite](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage-sqlite) to store sessions. You can change this by passing a different Session Adaptor to `shopifyApp`. To make this easy Shopify offer's [7 production ready session adaptors](https://github.com/Shopify/shopify-app-js/tree/release-candidate/packages)

In this example we'll swap the default session adaptor for [Prisma](https://www.prisma.io/).

Let's pass the [Prisma app session storage](https://github.com/Shopify/shopify-app-js/blob/release-candidate/packages/shopify-app-session-storage-prisma/README.md) adaptor to `shopifyApp`:

```ts
// app/shopify.server.js
import { shopifyApp } from "@shopify/shopify-app-express";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

Note that this requires a `schema.prisma` file as defined in the README for [Prisma app session storage](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage-prisma)
