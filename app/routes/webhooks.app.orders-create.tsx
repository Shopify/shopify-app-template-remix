import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // [START process-webhooks]
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  // TODO: Process the webhook
  // [END process-webhooks]

  // [START respond]
  return new Response();
  // [START respond]
};
