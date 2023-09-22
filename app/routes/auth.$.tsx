import type { LoaderArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticate.admin(request);

  return null;
};
