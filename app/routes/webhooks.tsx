import type { ActionArgs } from "@remix-run/node";

import { shopifyServer } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionArgs) => {
  const { topic, shop } = await shopifyServer.authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await db.session.deleteMany({ where: { shop } });
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
