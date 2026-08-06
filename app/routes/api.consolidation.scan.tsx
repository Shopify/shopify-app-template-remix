import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createScan } from "../lib/consolidation.server";

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const vendor = (form.get("vendor") as string)?.trim() || undefined;
  const scanId = await createScan(session.shop, vendor);
  return json({ scanId });
}
