import { authenticator } from '../../shopify/authenticator.server'

export async function loader({request}) {
  return authenticator.authenticate('shopify-app', request);
}
