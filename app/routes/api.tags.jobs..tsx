import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * GET /api/tags/jobs/:id
 * Restituisce lo stato + stats di un job.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const jobId = parseInt(params.id || "0");
  if (!jobId) return json({ error: "Invalid id" }, { status: 400 });

  const job = await prisma.tagJob.findFirst({
    where: { id: jobId, shop },
  });
  if (!job) return json({ error: "Not found" }, { status: 404 });

  const progress =
    job.totalItems > 0 ? Math.round((job.processedItems / job.totalItems) * 100) : 0;

  return json({
    id: job.id,
    kind: job.kind,
    status: job.status,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    successItems: job.successItems,
    failedItems: job.failedItems,
    progress,
    errorLog: job.errorLog ? JSON.parse(job.errorLog) : [],
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    createdAt: job.createdAt,
  });
}
