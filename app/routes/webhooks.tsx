import { app } from "../shopify/app.server";

export const action = async ({ request }) => {
  await app.authenticate.webhook(request);

  return new Response(null, { status: 200 });
};
