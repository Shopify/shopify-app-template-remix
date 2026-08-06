import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createTagJob } from "../lib/tag-jobs.server";

/**
 * POST /api/tags/jobs/create
 * Body: { kind: "generate" | "push" | "bulk_remove" | "cleanup_sku", productIds: string[], options?: {...} }
 * Returns: { jobId: number }
 */
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const body = await request.json();
  const { kind, productIds, options } = body as {
    kind: "generate" | "push" | "bulk_remove" | "cleanup_sku";
    productIds: string[];
    options?: Record<string, any>;
  };

  if (!kind || !productIds || !Array.isArray(productIds)) {
    return json({ error: "Invalid body: kind and productIds required" }, { status: 400 });
  }

  const validKinds = ["generate", "push", "bulk_remove", "cleanup_sku"];
  if (!validKinds.includes(kind)) {
    return json({ error: `Invalid kind. Must be: ${validKinds.join(", ")}` }, { status: 400 });
  }

  if (productIds.length === 0) {
    return json({ error: "productIds empty" }, { status: 400 });
  }

  if (productIds.length > 5000) {
    return json(
      { error: "Too many productIds (max 5000 per job). Split into multiple jobs." },
      { status: 400 }
    );
  }

  const jobId = await createTagJob({ shop, kind, productIds, options });

  return json({ jobId, totalItems: productIds.length });
}
