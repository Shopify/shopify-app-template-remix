import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async () => {
  throw new Response("Unhandled webhook topic", { status: 404 });
};
