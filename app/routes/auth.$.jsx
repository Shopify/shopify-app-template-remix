import { shopify } from "../shopify.server";

export async function loader({ request }) {
  await shopify.authenticate.admin(request);

  return null;
}
