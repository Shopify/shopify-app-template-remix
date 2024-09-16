import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const HANDLERS = import.meta.glob("./webhooks/*.tsx", { eager: true });

// Turns `CUSTOMERS_DATA_REQUEST` into `customers/data_request`
function normalizeTopic(topic: string) {
  // This very much intentionally only replaces the first underscore
  return topic.toLowerCase().replace("_", "/");
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic } = await request.json();
  const normalizedTopic = normalizeTopic(topic);

  for(let [path, {TOPIC, action}] of Object.entries(HANDLERS)) {
    // If the topic is not explicitly set, infer it from the file name
    if(!TOPIC) {
      const fileName = path.split("/").at(-1);
      if(!fileName) throw new Error(`Invalid webhook file name: ${path}`);
      TOPIC = fileName.replace(".", "/");
    }

    if(normalizedTopic === TOPIC) {
      return action(request);
    }
  }
  throw new Response(`Unhandled webhook topic: ${topic}`, { status: 404 });
};
