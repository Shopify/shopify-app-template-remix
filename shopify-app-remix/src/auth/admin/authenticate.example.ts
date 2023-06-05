import { shopify } from "shopify.server.ts";

import { LoaderArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin, sessionToken } = await shopify.authenticate.admin(request);

  console.log(`Current user is ${sessionToken.sub}`);
  const productCount = await admin.rest.Product.count({});

  return json({ productCount });
};
