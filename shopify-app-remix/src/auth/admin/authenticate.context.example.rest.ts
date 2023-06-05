import { shopify } from "shopify.server.ts";

import { LoaderArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin } = await shopify.authenticate.admin(request);

  const productCount = await admin.rest.get({ path: "/products/count.json" });

  return json({ productCount });
};
