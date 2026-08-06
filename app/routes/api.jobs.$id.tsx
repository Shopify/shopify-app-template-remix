import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getJob } from "../lib/jobs.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const jobId = params.id;

  if (!jobId) {
    return json({ error: "Missing job id" }, { status: 400 });
  }

  const job = await getJob(jobId, session.shop);

  if (!job) {
    return json({ error: "Job not found" }, { status: 404 });
  }

  return json({
    id: job.id,
    type: job.type,
    status: job.status,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    successCount: job.successCount,
    errorCount: job.errorCount,
    results: JSON.parse(job.results || "[]"),
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
};
