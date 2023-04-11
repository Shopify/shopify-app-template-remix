const storeURL = process.env.SHOPIFY_STORE_URL
const appURL = process.env.SHOPIFY_APP_URL

const app = {
  name: process.env.SHOPIFY_APP_NAME,
  api: {
    key: process.env.SHOPIFY_APP_API_KEY,
    scopes: process.env.SHOPIFY_APP_SCOPES,
    secret: process.env.SHOPIFY_APP_API_SECRET,
    version: process.env.SHOPIFY_APP_API_VERSION,
  },
  urls: {
    app: appURL,
    store: storeURL,
    webhooks: new URL(process.env.SHOPIFY_APP_WEBHOOK_PATH, appURL).toString(),
    auth: {
      authorization: new URL(process.env.SHOPIFY_APP_AUTH_AUTHORIZATION_PATH, storeURL).toString(),
      callback: new URL(process.env.SHOPIFY_APP_AUTH_CALLBACK_PATH, appURL).toString(),
    },
  },
  webhooks: {
    topics: process.env.SHOPIFY_APP_WEBHOOK_TOPICS.split(','),
  },
}

export {app}
