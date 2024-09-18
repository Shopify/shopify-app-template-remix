import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.webhook(request);

  // SHOP_REDACT will be fired up to 48 hours after app is uninstalled
  // Therefore, for SHOP_REDACT we expect the admin to be undefined
  if (!session) {
    return new Response("", { status: 400 });
  }

  // Implement handling of mandatory compliance topics
  // See: https://shopify.dev/docs/apps/build/privacy-law-compliance
  console.log("Received shop redact webhook");

  return new Response();
};
