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

We will start with a brand new Remix app that uses the indie-stack:

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
import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

import prisma from "~/db.server";

export const shopify = shopifyApp({
  apiKey: "1707326264fde5037c658n120626ce3f",
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ["read_products"],
  apiVersion: LATEST_API_VERSION,
  restResources,
  isEmbeddedApp: true,
});
```

| option        | description                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey        | The Client ID for your app. Copy it from your app in the Shopify partners dashboard. This is public.                                                                 |
| apiSecretKey  | The API Secret for your app. Copy it from your app in the Shopify partners dashboard. This is private. Do not commit this.                                           |
| appUrl        | This is the URL for your app.                                                                                                                                        |
| scopes        | What permissions your app needs. [More information](https://shopify.dev/docs/api/usage/access-scopes).                                                               |
| apiVersion    | What version of the [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql) do you want to use. If you are creating anew app use LATEST_API_VERSION. |
| restResources | What version of the [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest) do you want to use. If you are creating anew app use LATEST_API_VERSION.       |
| isEmbeddedApp | Should your app render inside admin. Shopify prefers embedded unless your app has special requirements.                                                              |

This will require some environment variables. So let's create an `.env` file:

```env
SHOPIFY_API_SECRET="[Copy from partners dashboard]"
SHOPIFY_APP_URL="[The tunnel URL you are using to run your app]"
```

`shopifyApp` needs to reserve one route. The default is `apps/routes/auth/$.tsx`, but you can configure this route by passing different options to `shopifyApp`. Create `apps/routes/auth/$.tsx` now. It should export a loader that uses `shopifyApp` to authenticate:

```ts
// app/routes/auth/$.tsx
import { LoaderArgs } from "@remix-run/node";

import { shopify } from "../../shopify.server";

export async function loader({ request }: LoaderArgs) {
  return shopify.authenticate.admin(request);
}
```

To load your app within the Shopify Admin, you need to:

1. Update your app's URL in your Partners Dashboard app setup page to `http://localhost:8080`
1. Update your app's callback URL to `http://localhost:8080/api/auth/callback` in that same page
1. Go to **Test your app** in Partners Dashboard and select your development store

## Authenticating admin requests

To access merchant data pass a request from a route `loader` or `action`. This will either redirect the merchant to install your app or it will give you access to API functions.

Here is how you might use the Admin REST API:

```ts
// routes/**/*.tsx
import { shopify } from "../shopify.server";
import { LoaderArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);

  return json(await admin.rest.Product.count({ session }));
};
```

Here is how you might use the Admin GraphQL API:

```ts
// routes/**/*.tsx
import { shopify } from "../shopify.server";
import { ActionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  const { admin } = await shopify.authenticate.admin(request);

  await admin.graphql.query({
    data: {
      query: `#graphql
          mutation populateProduct($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
              }
            }
          }
        `,
      variables: {
        input: {
          title: "New product",
          variants: [{ price: 100 }],
        },
      },
    },
  });

  return null;
}
```

## Authenticating webhook requests

Your app must respond to [mandatory webhook topics](https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks). In addition, your app can register [optional webhook topics](https://shopify.dev/docs/api/admin-rest/2023-04/resources/webhook#event-topics).

To setup webhooks first we need to configure `shopifyApp`:

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

export const loader = async ({ request }: LoaderArgs) => {
  const { sessionToken } = await shopify.authenticate.storefront(request);

  return json(await admin.rest.Product.count({ session }));
};
```

This can be useful if your app exposes checkout or theme extensions and those extensions need to access data from your app.

## Next steps

Now that your app is up and running, you can learn more about the `shopifyApp` object in [the reference docs](./docs/reference/shopifyApp.md).
