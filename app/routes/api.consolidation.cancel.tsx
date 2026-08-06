import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { cancelScan } from "../lib/consolidation.server";

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  let scanId: number | undefined;
  try {
    const b = await request.json();
    if (b?.scanId) scanId = parseInt(b.scanId);
  } catch {
    /* nessun body: ferma tutte le scansioni attive dello shop */
  }
  const count = await cancelScan(session.shop, scanId);
  return json({ ok: true, count });
}
