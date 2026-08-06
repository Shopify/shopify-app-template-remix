import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { processChunk, markJobFailed } from "../lib/jobs.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const jobId = formData.get("jobId") as string;

  if (!jobId) {
    return json({ error: "Missing jobId" }, { status: 400 });
  }

  try {
    const result = await processChunk(jobId);
    return json(result);
  } catch (err: any) {
    await markJobFailed(jobId, err.message || "Unknown error");
    return json({ error: err.message, done: true }, { status: 500 });
  }
};
