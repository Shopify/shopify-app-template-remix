import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { processScanBatch } from "../lib/consolidation.server";

// Vercel functions default to a short timeout; a scan batch needs more room.
export const config = { maxDuration: 60 };

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  let targetId: number | null = null;
  try {
    const b = await request.json();
    if (b?.scanId) targetId = parseInt(b.scanId);
  } catch {
    /* no body */
  }

  const scans = targetId
    ? await prisma.consolidationScan.findMany({ where: { id: targetId, status: { in: ["queued", "running"] } }, take: 1 })
    : await prisma.consolidationScan.findMany({ where: { status: { in: ["queued", "running"] } }, orderBy: { createdAt: "asc" }, take: 1 });

  const results: any[] = [];
  for (const s of scans) {
    try {
      results.push({ scanId: s.id, ...(await processScanBatch(admin, s.id)) });
    } catch (e: any) {
      results.push({ scanId: s.id, error: e.message });
      await prisma.consolidationScan.update({ where: { id: s.id }, data: { status: "failed", errorLog: String(e.message).slice(0, 500) } });
    }
  }
  return json({ processed: results.length, results });
}

export async function loader({ request }: LoaderFunctionArgs) {
  return action({ request } as ActionFunctionArgs);
}
