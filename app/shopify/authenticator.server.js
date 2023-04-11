import * as tokenStorage from '../models/token.server'
import {Authenticator} from 'remix-auth'
import {ShopifyAppAuthStrategy, ShopifyAppWebhookAuthStrategy} from '@shopify/remix-auth-strategy'
import {createCookieSessionStorage} from '@remix-run/node'
import {app} from './app.server'

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__state',
    secrets: [app.api.secret],
    sameSite: 'lax',
  },
})
const authenticator = new Authenticator(sessionStorage)

// Shopify authenticator
const shopifyAppAuthStrategy = new ShopifyAppAuthStrategy({
  ...app,
  tokenStorage,
  hooks: {
    onAuthCompleted: async ({admin}) => shopifyAppWebhookAuthStrategy.subscribeToTopics({admin}),
  },
})
authenticator.use(shopifyAppAuthStrategy, 'shopify-app')

// Webhook authenticator
const shopifyAppWebhookAuthStrategy = new ShopifyAppWebhookAuthStrategy({...app, tokenStorage})
authenticator.use(shopifyAppWebhookAuthStrategy, 'shopify-webhook')

export {authenticator}
