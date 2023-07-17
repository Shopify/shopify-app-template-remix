import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  await authenticate.admin(request);

  return null;
}
