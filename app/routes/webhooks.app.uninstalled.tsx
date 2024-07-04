import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, admin } = await authenticate.webhook(request);
  if (!admin) throw new Response();

  if (session) await db.session.deleteMany({ where: { shop } });
};
