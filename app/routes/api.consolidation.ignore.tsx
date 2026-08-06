import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ignoreGroup } from "../lib/consolidation.server";

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const bucketKey = (form.get("bucketKey") as string) || "";
  if (!bucketKey) return json({ error: "bucketKey required" }, { status: 400 });
  const count = await ignoreGroup(session.shop, bucketKey);
  return json({ ok: true, count });
}
