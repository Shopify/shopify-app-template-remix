import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";

// Optional. If not provided, the topic will be inferred from the file name.
// export const TOPIC = "app/uninstalled";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, admin } = await authenticate.webhook(request);
  if (!admin) throw new Response();

  if (session) await db.session.deleteMany({ where: { shop } });
};
