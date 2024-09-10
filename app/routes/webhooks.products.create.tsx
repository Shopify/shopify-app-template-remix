import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, payload } = await authenticate.webhook(request);

  // Webhook requests can trigger after an app is uninstalled
  // If the app is already uninstalled, the session may be undefined.
  if (!session) {
    return new Response()
  }

  console.log("Received products create webhook");
  console.log(JSON.stringify(payload));

  return new Response();
};