// app/routes/api.gift-finder.chat.tsx
// 32 CONCEPT STORE — Gift Finder Chat AI v2 con full-text + multi-query

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  loadFullCatalog,
  searchInCatalog,
  searchInCollection,
  compressProductsForAI,
  getRandomSample,
  type ShopifyProduct,
} from "../lib/shopify-catalog.server";
import { cacheGet, cacheSet } from "../lib/kv-cache.server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1500;
const MAX_TOOL_ITERATIONS = 4;

const CATALOG_CACHE_KEY = "gf:full-catalog:v2";
const CATALOG_CACHE_TTL = 60 * 60 * 12;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

let memCatalog: ShopifyProduct[] | null = null;
let memCatalogLoadedAt: number = 0;

async function getCatalog(): Promise<ShopifyProduct[]> {
  const now = Date.now();
  if (memCatalog && (now - memCatalogLoadedAt) < 5 * 60 * 1000) {
    return memCatalog;
  }

  try {
    const cached = await cacheGet<ShopifyProduct[]>(CATALOG_CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 100) {
      memCatalog = cached;
      memCatalogLoadedAt = now;
      console.log("[catalog] Loaded " + cached.length + " from KV");
      return cached;
    }
  } catch (e) {
    console.warn("KV read error:", (e as Error).message);
  }

  console.log("[catalog] Loading fresh from Shopify...");
  const fresh = await loadFullCatalog();
  if (fresh.length > 0) {
    memCatalog = fresh;
    memCatalogLoadedAt = now;
    try {
      await cacheSet(CATALOG_CACHE_KEY, fresh, CATALOG_CACHE_TTL);
    } catch (e) {
      console.warn("KV write error:", (e as Error).message);
    }
  }
  return fresh;
}

const TOOLS = [
  {
    name: "search_catalog",
    description: "Cerca prodotti nel catalogo. IMPORTANTE: passa MULTIPLE QUERY/SINONIMI insieme. Per 'borraccia' passa ['borraccia','bottiglia','thermos','24bottles']. Per 'lampada divertente' passa ['lampada','luce','led','colorata','fisura']. Ricerca full-text su titolo + descrizione + tag + vendor.",
    input_schema: {
      type: "object",
      properties: {
        queries: {
          type: "array",
          items: { type: "string" },
          description: "Array di 3-6 sinonimi/varianti italiani+inglesi+brand correlati"
        },
        min_price: { type: "number" },
        max_price: { type: "number" },
      },
      required: ["queries"],
    },
  },
  {
    name: "get_collection_products",
    description: "Prodotti da collezione Shopify (es. 'festa-mamma', 'compleanno', 'laurea'). Solo per occasioni dedicate.",
    input_schema: {
      type: "object",
      properties: {
        collection_handle: { type: "string" },
        min_price: { type: "number" },
        max_price: { type: "number" },
        keyword: { type: "string" },
      },
      required: ["collection_handle"],
    },
  },
];

function buildSystemPrompt(inspirationProducts: ShopifyProduct[]): string {
  const inspirationStr = compressProductsForAI(inspirationProducts.slice(0, 30));
  const parts: string[] = [];
  parts.push("Sei il personal shopper AI di 32 Concept Store, negozio italiano (Bari) di design e regali.");
  parts.push("");
  parts.push("# Tono: caldo, italiano, frasi brevi (max 3-4), emoji con parsimonia.");
  parts.push("");
  parts.push("# Come rispondi:");
  parts.push("1. Se mancano info essenziali (destinatario/occasione/budget) fai UNA domanda alla volta.");
  parts.push("2. Quando hai abbastanza info, USA SUBITO i tool. NON inventare prodotti.");
  parts.push("3. Dopo aver cercato, scegli 3-4 prodotti adatti motivandoli brevemente.");
  parts.push("");
  parts.push("# REGOLA FONDAMENTALE per search_catalog:");
  parts.push("Quando l'utente cerca un tipo di prodotto, generi SEMPRE 3-6 sinonimi italiani+inglesi+brand correlati.");
  parts.push("");
  parts.push("Esempi concreti:");
  parts.push("- 'borraccia' -> queries: ['borraccia', 'bottiglia', 'thermos', '24bottles', 'water bottle']");
  parts.push("- 'lampada divertente' -> queries: ['lampada', 'luce', 'led', 'colorata', 'lucetta', 'fisura']");
  parts.push("- 'agenda 2026' -> queries: ['agenda', 'planner', 'diario', 'moleskine', 'legami']");
  parts.push("- 'profumo casa' -> queries: ['diffusore', 'candela profumata', 'yankee candle', 'bastoncini']");
  parts.push("- 'gioco bambino' -> queries: ['gioco', 'giocattolo', 'peluche', 'puzzle', 'creativo']");
  parts.push("- 'penna lusso' -> queries: ['penna', 'lamy', 'stilografica', 'premium', 'pilot']");
  parts.push("- 'tazza divertente' -> queries: ['tazza', 'mug', 'colorata', 'legami']");
  parts.push("");
  parts.push("Se la prima ricerca dà pochi risultati, FAI UN'ALTRA RICERCA con sinonimi diversi.");
  parts.push("");
  parts.push("# Tool:");
  parts.push("- search_catalog(queries[], min_price?, max_price?) - ricerca full-text con sinonimi");
  parts.push("- get_collection_products(collection_handle, ...) - solo occasioni dedicate");
  parts.push("");
  parts.push("# Collezioni occasioni (handle):");
  parts.push("festa-mamma, festa-papa, compleanno, laurea, anniversario-matrimonio, idee-regalo-nascita, natale");
  parts.push("");
  parts.push("# Brand: Legami, EDG, Egan, Lamy, Seletti, Moulin Roty, Yankee Candle, 24Bottles, Moleskine, Ichendorf, Kikkerland, Goofi, Piattini d'Avanguardia, Fisura, Lexon, Pilot.");
  parts.push("");
  parts.push("# Esempi ispirazione (30 prodotti random dal catalogo):");
  parts.push(inspirationStr);
  parts.push("");
  parts.push("# Formato risposta:");
  parts.push("Quando hai trovato prodotti, referenziali con [handle-prodotto] tra parentesi quadre.");
  parts.push("Esempio: 'Per la mamma: [candela-fiori] candela 28€, [tazza-rosa] tazza Legami. Vuoi vederne altre?'");
  parts.push("I tag [handle] diventano card cliccabili. SOLO handle che esistono nei risultati. MAI inventare.");
  parts.push("Concludi sempre con UNA opzione per continuare.");
  return parts.join("\n");
}

async function executeTool(
  name: string,
  input: any,
  catalog: ShopifyProduct[]
): Promise<{ products: ShopifyProduct[]; summary: string }> {
  try {
    if (name === "search_catalog") {
      let queries: string[] = [];
      if (Array.isArray(input.queries)) {
        queries = input.queries.filter((q: any) => typeof q === "string" && q.trim());
      }
      if (queries.length === 0 && input.query) {
        queries.push(String(input.query));
      }
      if (queries.length === 0) return { products: [], summary: "Nessuna query fornita." };

      const products = searchInCatalog({
        catalog,
        queries,
        minPrice: input.min_price,
        maxPrice: input.max_price,
        limit: 12,
      });

      if (products.length === 0) {
        return { products: [], summary: "Nessun prodotto trovato con queries: " + queries.join(", ") };
      }
      return {
        products,
        summary: "Trovati " + products.length + " prodotti per [" + queries.join(", ") + "]:\n" + compressProductsForAI(products),
      };
    }

    if (name === "get_collection_products") {
      const handle = String(input.collection_handle || "").trim();
      if (!handle) return { products: [], summary: "Handle vuoto." };

      const products = await searchInCollection(
        handle,
        input.keyword || "",
        12,
        input.min_price,
        input.max_price
      );
      if (products.length === 0) return { products: [], summary: "Collezione vuota: " + handle };
      return {
        products,
        summary: "Trovati " + products.length + " dalla collezione " + handle + ":\n" + compressProductsForAI(products),
      };
    }
    return { products: [], summary: "Unknown tool: " + name };
  } catch (e: any) {
    console.error("Tool error:", name, e);
    return { products: [], summary: "Tool error: " + (e?.message || "unknown") };
  }
}

function extractHandlesFromMessage(text: string): string[] {
  const matches = text.match(/\[([a-z0-9-]+)\]/gi) || [];
  return matches.map((m) => m.slice(1, -1)).filter((h) => h.length > 2);
}

export async function loader() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500, headers: CORS_HEADERS });

  let body: any;
  try { body = await request.json(); } catch (e) {
    return json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const history: Array<{ role: string; content: string }> = body.history || [];
  if (!Array.isArray(history) || history.length === 0) {
    return json({ error: "Missing history" }, { status: 400, headers: CORS_HEADERS });
  }

  let catalog: ShopifyProduct[] = [];
  try {
    catalog = await getCatalog();
  } catch (e) {
    console.error("Catalog load error:", e);
  }

  const inspiration = getRandomSample(catalog, 30);
  const systemPrompt = buildSystemPrompt(inspiration);

  let messages: any[] = history
    .slice(-12)
    .filter((m) => m && m.role && m.content)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 2000),
    }));

  const productMap = new Map<string, ShopifyProduct>();
  let finalText = "";
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;
    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: systemPrompt, tools: TOOLS, messages }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("=== ANTHROPIC ERROR ===", anthropicRes.status, errText);
      return json({ error: "AI service error: " + anthropicRes.status }, { status: 502, headers: CORS_HEADERS });
    }

    const data = await anthropicRes.json();
    const stopReason = data.stop_reason;
    const content = data.content || [];
    const toolUses = content.filter((b: any) => b.type === "tool_use");
    const textBlocks = content.filter((b: any) => b.type === "text");
    const accumulatedText = textBlocks.map((b: any) => b.text).join("\n").trim();

    if (stopReason === "tool_use" && toolUses.length > 0) {
      const toolResults = [];
      for (const tu of toolUses) {
        const result = await executeTool(tu.name, tu.input, catalog);
        for (const p of result.products) productMap.set(p.handle, p);
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: result.summary });
      }
      messages.push({ role: "assistant", content });
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    finalText = accumulatedText;
    break;
  }

  if (!finalText) finalText = "Mi dispiace, riprova tra un attimo.";

  const handles = extractHandlesFromMessage(finalText);
  const finalProducts = handles
    .map((h) => productMap.get(h))
    .filter((p): p is ShopifyProduct => !!p);

  const lastUser = history.filter((m) => m.role === "user").pop()?.content?.toLowerCase() || "";
  const sugg: string[] = [];
  if (!/\d+\s*€|euro/.test(lastUser)) { sugg.push("Sotto 30€"); sugg.push("Tra 30 e 80€"); }
  if (finalText.length < 200) sugg.push("Voglio vederne altri");
  sugg.push("Cambia stile");

  return json({
    message: finalText,
    products: finalProducts.map((p) => ({
      handle: p.handle,
      title: p.title,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      image: p.imageUrl,
      url: p.url,
      vendor: p.vendor,
    })),
    suggestions: sugg.slice(0, 4),
  }, { headers: CORS_HEADERS });
}
