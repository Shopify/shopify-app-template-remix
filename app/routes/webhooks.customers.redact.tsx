import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const {session} = await authenticate.webhook(request);

  // Webhook requests can trigger after an app is uninstalled
  // If the app is already uninstalled, the session may be undefined.
  if (!session) {
    throw new Response();
  }

  // Implement handling of mandatory compliance topics
  // See: https://shopify.dev/docs/apps/build/privacy-law-compliance
  console.log("Received customers redact webhook");

  return new Response();
};
