import type { LoaderFunctionArgs } from "@remix-run/node";
import { database } from "app/db.server";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { liquid } = await authenticate.public.appProxy(request);
  const db = await database;
  await db.read();
  const data = db.data.sections.find((entity: any) => entity.id === params.id);
  return liquid(data?.entities || "");
}