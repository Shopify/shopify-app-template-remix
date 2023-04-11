import { authenticator } from '../shopify/authenticator.server'

export const action = async ({request}) => {
    const { payload, topic } = await authenticator.authenticate('shopify-webhook', request);
    return new Response(null, { status: 200});
}
