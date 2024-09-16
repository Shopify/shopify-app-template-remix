import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const HANDLERS = import.meta.glob("./webhooks/*.tsx", { eager: true });

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic } = await request.json();

  for(let [path, {TOPIC, action}] of Object.entries(HANDLERS)) {
    // If the topic is not set, infer it from the file name
    if(!TOPIC) {
      const fileName = path.split("/").at(-1);
      if(!fileName) throw new Error(`Invalid webhook file name: ${path}`);
      TOPIC = fileName.split(".").slice(0, 1).join("/");
    }

    if(topic === TOPIC) {
      return action(request);
    }
  }
  throw new Response(`Unhandled webhook topic: ${topic}`, { status: 404 });
};
