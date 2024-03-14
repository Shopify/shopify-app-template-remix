# Shopify Credit Card Payments App Template - Remix [Javascript]

This is a template for building a [Credit Card Payments App](https://shopify.dev/docs/apps/payments) using the [Remix](https://remix.run/) framework in Javascript. This template includes a rough client for the Payments Apps API, as well as all the necessary routes for a simple Credit Card payments app.

_Notes:_
- mTLS configuration is not included in this template. This should be configured in your own infrastructure.
- Any `simulator` in this template is not intended for a production payments app. In production, once a payment (or refund, capture, void) session has been started, the provider's processing steps should begin automatically, and should resolve/reject the session when complete.

## Quick start

### Prerequisites

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

### App Setup
1. You must Create an app manually in the Partners Dashboard
1. Disable embedded in the Partners Dashboard
1. Create a credit card payments app extension for your app. This doesn't need to be filled in yet.
1. Replace App Name and API Client ID in the [shopify.app.toml](https://github.com/Shopify/example-app--payments-app-template--remix/blob/main-js/shopify.app.toml)
1. Run `yarn shopify app config push` to update your config with Shopify.
### Setup

If you used the CLI to create the template, you can skip this section.

Using yarn:

```shell
yarn install
```

Using npm:

```shell
npm install
```

Using pnpm:

```shell
pnpm install
```

### Local Development

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Before beginning development, set up your payments app extension. You can define a consitent tunnel for Shopify CLI to use with the `--tunnel` flag.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

Press P to open a page to install your app.

### App Extension

1. Return to your payments app extension to begin filling it in.
1. Set the payment and refund session URLs to the url hosted by `dev`.
1. Create a version.
1. Submit your extension for review.
1. Once approved, release the new version.
1. Now, you should be able to open the preview and set up your app through the configuration page.

_Note:_ You may have to uninstall and reinstall the app from your store if the configuration page raises an error like "Payments App is not installed on this shop".

#### Simulating a payment

You can simulate payment success or failure by entering specific values for the first name and last name of the billing address or shipping address during the first steps of the checkout.

| first name | last name| payment result|
|------------|----------|---------------|
| <any_name> | <any_name> | ✅ resolved |
| reject | incorrect_number | ❌ rejected <reason: INCORRECT_NUMBER> |
| reject | incorrect_cvc | ❌ rejected <reason: INCORRECT_CVC> |
| reject | incorrect_zip | ❌ rejected <reason: INCORRECT_ZIP> |
| reject | incorrect_address | ❌ rejected <reason: INCORRECT_ADDRESS> |
| reject | incorrect_pin | ❌ rejected <reason: INCORRECT_PIN> |
| reject | invalid_number | ❌ rejected <reason: INVALID_NUMBER> |
| reject | invalid_cvc | ❌ rejected <reason: INVALID_CVC> |
| reject | invalid_expiry_date | ❌ rejected <reason: INVALID_EXPIRY_DATE> |
| reject | expired_card |	❌ rejected <reason: EXPIRED_CARD> |
| reject | card_declined | ❌ rejected <reason: CARD_DECLINED> |

If you have entered valid credit card information, after clicking Pay now, you should be redirected to the processing page, then your payment should be resolved or rejected depending on the simulation scenario chosen above:

- Resolved payment should redirect you to the Thank you page.
- Rejected payment should bring you back to the checkout page with an error message.

Payments processed through this application are visible in the Dashboard (/app/dashboard)

#### Encryption

Since this is a credit card payments app, it supports encryption. You can uncomment [this line](https://github.com/Shopify/example-app--credit-card-payments-app-template--remix/blob/main-js/app/routes/app.payment_session.jsx#L22), and add your [private key](https://github.com/Shopify/example-app--credit-card-payments-app-template--remix/blob/main-js/app/encryption.js#L4) to test our included payload decryption.

---

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return json(nodes);
}
```

This template come preconfigured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.ts](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/shopify.server.ts)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.tsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/app._index.tsx).
3. Responding to mandatory webhooks in [/app/routes/webhooks.tsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/webhooks.tsx)

Please read the [documentation for @shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix#authenticating-admin-requests) to understand what other API's are available.

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
You can run your database of choice on a server yourself or host it with a SaaS company.
Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/tree/main/docs/guides/session-storage.md).

### Build

Remix handles building the app for you, by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

### Hosting on Vercel

When hosting your Shopify Remix app on Vercel, Vercel uses a fork of the [Remix library](https://github.com/vercel/remix).

To  ensure all global variables are set correctly when you deploy your app to Vercel update your app to use the Vercel adapter instead of the node adapter.

```diff
// shopify.server.ts
- import "@shopify/shopify-app-remix/adapters/node";
+ import "@shopify/shopify-app-remix/adapters/vercel";
```

## Gotchas / Troubleshooting

### Database tables don't exist

If you run the app right after creating it, you'll get this error:

```
The table `main.Session` does not exist in the current database.
```

This will happen when the Prisma database hasn't been created.
You can solve this by running the `setup` script in your app.

### Navigating to other pages breaks

In Remix apps, you can navigate to a different page either by adding an `<a>` tag, or using the `<Link>` component from `@remix-run/react`.

In Shopify Remix apps you should avoid using `<a>`. Use `<Link> `from `@remix-run/react` instead. This ensures that your user remains authenticated.

### OAuth goes into a loop when I change my app's scopes

If you change your app's scopes and authentication goes into a loop and fails with a message from Shopify that it tried too many times, you might have forgotten to update your scopes with Shopify.
To do that, you can run the `deploy` CLI command.

Using yarn:

```shell
yarn deploy
```

Using npm:

```shell
npm run deploy
```

Using pnpm:

```shell
pnpm run deploy
```

### My webhook subscriptions aren't being updated

This template registers webhooks after OAuth completes, using the `afterAuth` hook when calling `shopifyApp`.
The package calls that hook in 2 scenarios:
- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so the subscriptions aren't updated.

To force your app to update the subscriptions, you can uninstall and reinstall it in your development store.
That will force the OAuth process and call the `afterAuth` hook.

### Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.

Create [webhook subscriptions]((https://shopify.dev/docs/api/shopify-app-remix/v1/guide-webhooks)) using the `shopifyApp` object instead.

Test your webhooks with the [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger) or by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for VS Code will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

in this situation, please update the [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-remix/blob/main/.graphqlrc.ts) config.

### First parameter has member 'readable' that is not a ReadableStream.

See [hosting on Vercel](#hosting-on-vercel).

## Benefits

Shopify apps are built on a variety of Shopify tools to create a great merchant experience.

The Remix app template comes with the following out-of-the-box functionality:

- [OAuth](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-admin-requests): Installing the app and granting permissions
- [GraphQL Payments Apps API](https://shopify.dev/docs/api/payments-apps): The Payments Apps API enables you to programmatically access your payments app's configuration data
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Tech Stack

This template uses [Remix](https://remix.run). The following Shopify tools are also included to ease app development:

- [Shopify App Remix](https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-remix/README.md) provides authentication and methods for interacting with Shopify APIs.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

> **Note**: This template runs on JavaScript, but it's fully set up for [TypeScript](https://www.typescriptlang.org/).
> If you want to create your routes using TypeScript, we recommend removing the `noImplicitAny` config from [`tsconfig.json`](/tsconfig.json)

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://github.com/Shopify/shopify-app-js/blob/release-candidate/packages/shopify-app-remix/README.md)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Introduction to Payments Apps](https://shopify.dev/docs/apps/payments)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
