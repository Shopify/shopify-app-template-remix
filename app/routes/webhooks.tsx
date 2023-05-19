import { ActionArgs } from "@remix-run/node";

import { shopify } from "../shopify.server";

export const action = async ({ request }: ActionArgs) => {
  const { admin } = await shopify.authenticate.webhook(request);

  // TODO: Add a switch statement on the topic catching the mandatory GDPR topics
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28375165
  return new Response(null, { status: 200 });
};
