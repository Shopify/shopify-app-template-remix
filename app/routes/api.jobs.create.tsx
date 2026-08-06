import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createJob } from "../lib/jobs.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const type = formData.get("type") as string; // "descriptions"
  const productsJSON = formData.get("products") as string;
  const settingsJSON = formData.get("settings") as string;

  if (!type || !productsJSON) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  const products = JSON.parse(productsJSON);
  const settings = JSON.parse(settingsJSON || "{}");

  const job = await createJob(
    session.shop,
    type,
    { products, settings },
    products.length
  );

  return json({ jobId: job.id, status: job.status });
};
