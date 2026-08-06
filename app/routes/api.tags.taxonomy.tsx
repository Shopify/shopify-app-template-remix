import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { loadTaxonomy, saveTaxonomy } from "../lib/taxonomy.server";
import type { Taxonomy } from "../lib/taxonomy.server";

/**
 * GET /api/tags/taxonomy
 * Restituisce la tassonomia attuale (dal DB, fallback JSON se mai inizializzata).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const taxonomy = await loadTaxonomy(shop);
  return json({ taxonomy });
}

/**
 * POST /api/tags/taxonomy
 * Salva una nuova versione della tassonomia.
 * Body: { taxonomy: Taxonomy }
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const body = await request.json();
  const taxonomy = body.taxonomy as Taxonomy;

  if (!taxonomy || !taxonomy.groups || !Array.isArray(taxonomy.groups)) {
    return json({ error: "Invalid taxonomy structure" }, { status: 400 });
  }

  // Validazione base
  for (const group of taxonomy.groups) {
    if (!group.prefix || !group.label || !Array.isArray(group.values)) {
      return json(
        { error: `Invalid group structure: ${JSON.stringify(group)}` },
        { status: 400 }
      );
    }
    for (const v of group.values) {
      if (!v.value) {
        return json(
          { error: `Invalid value in group ${group.prefix}: ${JSON.stringify(v)}` },
          { status: 400 }
        );
      }
    }
  }

  await saveTaxonomy(shop, taxonomy);
  return json({ success: true });
}
