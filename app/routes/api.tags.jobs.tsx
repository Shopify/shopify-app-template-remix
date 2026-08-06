import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * GET /api/tags/jobs
 * Restituisce la lista dei job recenti (ultimi 30).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const jobs = await prisma.tagJob.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return json({
    jobs: jobs.map(j => ({
      id: j.id,
      kind: j.kind,
      status: j.status,
      totalItems: j.totalItems,
      processedItems: j.processedItems,
      successItems: j.successItems,
      failedItems: j.failedItems,
      progress: j.totalItems > 0 ? Math.round((j.processedItems / j.totalItems) * 100) : 0,
      errorLog: j.errorLog ? JSON.parse(j.errorLog) : [],
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      createdAt: j.createdAt,
    })),
  });
}
