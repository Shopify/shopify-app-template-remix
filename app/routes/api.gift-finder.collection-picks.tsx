// app/routes/api.gift-finder.collection-picks.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  getCollectionProducts,
  type ShopifyProduct,
} from "../lib/shopify-catalog.server";
import { getCachedCollectionPicks } from "../lib/kv-cache.server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

interface AIPick {
  handle: string;
  reason: string;
}

async function pickTopProducts(
  collectionTitle: string,
  collectionDesc: string,
  products: ShopifyProduct[]
): Promise<AIPick[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  if (products.length <= 6) {
    return products.map((p) => ({ handle: p.handle, reason: "" }));
  }

  const productList = products
    .slice(0, 50)
    .map((p, i) => {
      const desc = p.description ? " | " + p.description.slice(0, 100) : "";
      return (i + 1) + ". [" + p.handle + "] " + p.title + " | " + (p.vendor || "—") + " | €" + p.price + desc;
    })
    .join("\n");

  const systemParts: string[] = [];
  systemParts.push("Sei un curatore esperto di regali per 32 Concept Store, negozio italiano di design.");
  systemParts.push("Ti viene data una lista di prodotti di una collezione. Devi scegliere i 6-8 MIGLIORI considerando:");
  systemParts.push("- Varietà di prezzo (accessibile, medio, pregiato)");
  systemParts.push("- Varietà di stile (non 6 candele identiche)");
  systemParts.push("- Probabilità che siano apprezzati come regalo");
  systemParts.push("- Attrattiva del titolo");
  systemParts.push("");
  systemParts.push("Per ogni prodotto scelto, scrivi un motivo BREVE (max 12 parole) accattivante in italiano.");
  systemParts.push("");
  systemParts.push("Rispondi SOLO con JSON valido in questo formato esatto:");
  systemParts.push('{"picks": [{"handle": "candela-vaniglia", "reason": "Profumo caldo, ideale per il salotto"}]}');
  systemParts.push("");
  systemParts.push("Includi SOLO handle che esistono nella lista. Massimo 8, minimo 6.");
  const systemPrompt = systemParts.join("\n");

  const userPrompt = "Collezione: " + collectionTitle +
    (collectionDesc ? "\nDescrizione: " + collectionDesc.slice(0, 200) : "") +
    "\n\nProdotti disponibili (" + products.length + "):\n" + productList +
    "\n\nScegli i 6-8 migliori per regalo.";

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error("AI error " + res.status + ": " + t.slice(0, 200));
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "";

  let parsed: any = null;
  try {
    parsed = JSON.parse(text.trim());
  } catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch (_) { return []; }
    } else return [];
  }

  if (!parsed || !Array.isArray(parsed.picks)) return [];

  const validHandles = new Set(products.map((p) => p.handle));
  return parsed.picks
    .filter((p: any) => p && p.handle && validHandles.has(p.handle))
    .map((p: any) => ({
      handle: String(p.handle),
      reason: String(p.reason || "").slice(0, 200),
    }))
    .slice(0, 8);
}

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const handle = url.searchParams.get("handle")?.trim();
  if (!handle) {
    return json({ error: "Missing handle param" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const result = await getCachedCollectionPicks(handle, async () => {
      const { collection, products } = await getCollectionProducts(handle, 50);
      if (!collection || products.length === 0) {
        return { collection: null, picks: [] };
      }

      const aiPicks = await pickTopProducts(
        collection.title,
        collection.description || "",
        products
      );

      const productByHandle = new Map(products.map((p) => [p.handle, p]));
      const picks = aiPicks
        .map((ap) => {
          const p = productByHandle.get(ap.handle);
          if (!p) return null;
          return {
            handle: p.handle,
            title: p.title,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            image: p.imageUrl,
            url: p.url,
            vendor: p.vendor,
            reason: ap.reason,
          };
        })
        .filter(Boolean);

      return {
        collection: { title: collection.title, description: collection.description },
        picks,
      };
    });

    return json(result, {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=300, s-maxage=21600",
      },
    });
  } catch (e: any) {
    console.error("collection-picks error:", e);
    return json({ error: e?.message || "Internal error" }, { status: 500, headers: CORS_HEADERS });
  }
}
