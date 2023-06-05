import { shopify } from "shopify.server.ts";

import { LoaderArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const { admin } = await shopify.authenticate.admin(request);

  const shopName = await admin.graphql.query({
    data: { query: `query { shop { name } }` },
  });

  return json({ shopName });
};
