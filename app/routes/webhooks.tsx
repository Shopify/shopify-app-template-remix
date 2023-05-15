import { ActionArgs } from "@remix-run/node";

import { app } from "../shopify/app.server";

export const action = async ({ request }: ActionArgs) => {
  const { admin } = await app.authenticate.webhook(request);

  return new Response(null, { status: 200 });
};
