# Shopify App Template - Remix

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using the [Remix](https://remix.run) framework.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](https://shopify.dev/docs/apps/getting-started/create).

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-remix) for more details on the Remix app package.

## Quick start

### Prerequisites

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
2. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
3. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

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

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

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

## Gotchas / Troubleshooting

### Database tables don't exist

If you get this error:

```
The table `main.Session` does not exist in the current database.
```

You need to create the database for Prisma. Run the `setup` script in `package.json` using your preferred package manager.

### Navigating/redirecting breaks an embedded app

Embedded Shopify apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `@remix-run/react` or `@shopify/polaris`. Do not use `<a>`.
2. Use the `redirect` helper returned from `authenticate.admin`. Do not use `redirect` from `@remix-run/node`
3. Use `useSubmit` or `<Form/>` from `@remix-run/react`. Do not use a lowercase `<form/>`.

This only applies if you app is embedded, which it will be by default.

### Non Embedded

Shopify apps are best when they are embedded into the Shopify Admin. This template is configured that way. If you have a reason to not embed your please make 2 changes:

1. Change the `isEmbeddedApp` prop to false for the `AppProvider` in `/app/routes/app.jsx`
2. Remove any use of App Bridge APIs (`window.shopify`) from your code
3. Update the config for shopifyApp in `app/shopify.server.js`. Pass `isEmbeddedApp: false`

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

This template registers webhooks after OAuth completes, usng the `afterAuth` hook when calling `shopifyApp`.
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

## Benefits

Shopify apps are built on a variety of Shopify tools to create a great merchant experience.

<!-- TODO: Uncomment this after we've updated the docs -->
<!-- The [create an app](https://shopify.dev/docs/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app using this template. -->

The Remix app template comes with the following out-of-the-box functionality:

- [OAuth](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-admin-requests): Installing the app and granting permissions
- [GraphQL Admin API](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#using-the-shopify-admin-graphql-api): Querying or mutating Shopify admin data
- [REST Admin API](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#using-the-shopify-admin-rest-api): Resource classes to interact with the API
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur
- [AppBridge](https://shopify.dev/docs/api/app-bridge): This template uses the next generation of the Shopify App Bridge library which works in unison with previous versions.
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Tech Stack

This template uses [Remix](https://remix.run). The following Shopify tools are also included to ease app development:

- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix) provides authentication and methods for interacting with Shopify APIs.
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) allows your app to seamlessly integrate your app within Shopify's Admin.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
