import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { buildMergePlan, executeMerge } from "../lib/consolidation-merge.server";

export const config = { maxDuration: 60 };

export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const body = await request.json().catch(() => ({} as any));
  const { intent, productIds, masterProductId, featuredImageUrl, masterTitle, overrides } = body || {};

  if (!Array.isArray(productIds) || productIds.length < 2 || !masterProductId) {
    return json({ error: "Servono almeno 2 prodotti selezionati e un master." }, { status: 400 });
  }
  const opts = { featuredImageUrl, masterTitle, overrides };

  if (intent === "plan") {
    const plan = await buildMergePlan(session.shop, productIds, masterProductId, opts);
    return json({ plan });
  }
  if (intent === "execute") {
    const result = await executeMerge(admin, session.shop, productIds, masterProductId, opts);
    return json({ result });
  }
  return json({ error: "Intent non supportato." }, { status: 400 });
}
