import { LoaderArgs } from "@remix-run/node";

import { shopify } from "../shopify.server";

export async function loader({ request }: LoaderArgs) {
  return shopify.authenticate.admin(request);
}
