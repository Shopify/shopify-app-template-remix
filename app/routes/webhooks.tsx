import { ActionArgs } from "@remix-run/node";

import { app } from "../shopify/app.server";

export const action = async ({ request }: ActionArgs) => {
  const { admin } = await app.authenticate.webhook(request);

  // TODO: Add a switch statement on the topic catching the mandatory GDPR topics

  return new Response(null, { status: 200 });
};
