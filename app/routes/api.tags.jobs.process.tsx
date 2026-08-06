import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { processNextBatch } from "../lib/tag-jobs.server";

/**
 * POST /api/tags/jobs/process
 * Questo endpoint può essere chiamato da:
 *  - Frontend dopo aver creato un job
 *  - Un cron esterno (Vercel Cron, upstash, ecc) che processa tutti i job queued/running
 *
 * Opzionalmente accetta body { jobId: number } per processare solo un job specifico.
 */
export async function action({ request }: ActionFunctionArgs) {
  // Auth opzionale: se sei in produzione e vuoi proteggere, passa un token
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.TAG_JOB_WORKER_TOKEN;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  let targetJobId: number | null = null;
  try {
    const body = await request.json();
    if (body.jobId) targetJobId = parseInt(body.jobId);
  } catch (e) {
    // No body, processa tutti i job attivi
  }

  // Trova job da processare
  let jobs;
  if (targetJobId) {
    jobs = await prisma.tagJob.findMany({
      where: { id: targetJobId, status: { in: ["queued", "running"] } },
      take: 1,
    });
  } else {
    jobs = await prisma.tagJob.findMany({
      where: { status: { in: ["queued", "running"] } },
      orderBy: { createdAt: "asc" },
      take: 3, // processa al massimo 3 job per chiamata
    });
  }

  if (jobs.length === 0) {
    return json({ message: "No jobs to process", processedJobs: 0 });
  }

  const results = [];
  for (const job of jobs) {
    try {
      const result = await processNextBatch(job.id);
      results.push({ jobId: job.id, ...result });
    } catch (err: any) {
      results.push({ jobId: job.id, error: err.message || String(err) });
      await prisma.tagJob.update({
        where: { id: job.id },
        data: { status: "failed", errorLog: JSON.stringify([{ error: err.message }]) },
      });
    }
  }

  return json({ processedJobs: results.length, results });
}

/**
 * GET /api/tags/jobs/process
 * Variante GET per compatibilità con cron che supportano solo GET (es. Vercel Cron).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return action({ request } as ActionFunctionArgs);
}
