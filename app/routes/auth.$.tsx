import type { LoaderArgs } from "@remix-run/node";

import { shopifyServer } from "../shopify.server";

export async function loader({ request }: LoaderArgs) {
  return shopifyServer.authenticate.admin(request);
}
