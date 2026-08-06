// app/routes/api.gift-finder.debug.tsx
// Debug endpoint per verificare stato catalogo

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loadFullCatalog, searchInCatalog, type ShopifyProduct } from "../lib/shopify-catalog.server";
import { cacheGet, cacheSet } from "../lib/kv-cache.server";

const CATALOG_CACHE_KEY = "gf:full-catalog:v2";
const CATALOG_CACHE_TTL = 60 * 60 * 12;

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "status";
  const query = url.searchParams.get("q") || "";

  try {
    if (action === "refresh") {
      const start = Date.now();
      const fresh = await loadFullCatalog();
      try {
        await cacheSet(CATALOG_CACHE_KEY, fresh, CATALOG_CACHE_TTL);
      } catch (e) {
        return json({
          action: "refresh",
          total: fresh.length,
          time_ms: Date.now() - start,
          kv_save_error: (e as Error).message,
          sample: fresh.slice(0, 5).map(p => ({ handle: p.handle, title: p.title })),
        }, { headers: HEADERS });
      }
      return json({
        action: "refresh",
        total: fresh.length,
        time_ms: Date.now() - start,
        kv_saved: true,
        sample: fresh.slice(0, 5).map(p => ({ handle: p.handle, title: p.title, vendor: p.vendor })),
      }, { headers: HEADERS });
    }

    if (action === "search" && query) {
      const cached = await cacheGet<ShopifyProduct[]>(CATALOG_CACHE_KEY);
      if (!cached || cached.length === 0) {
        return json({ error: "Catalogo non in cache. Chiama prima ?action=refresh" }, { headers: HEADERS });
      }
      const queries = query.split(",").map(q => q.trim()).filter(Boolean);
      const results = searchInCatalog({ catalog: cached, queries, limit: 15 });
      return json({
        action: "search",
        queries,
        total_in_catalog: cached.length,
        found: results.length,
        results: results.map(p => ({
          handle: p.handle,
          title: p.title,
          vendor: p.vendor,
          price: p.price,
          desc_snippet: p.description.slice(0, 100),
        })),
      }, { headers: HEADERS });
    }

    if (action === "find_arcade") {
      const cached = await cacheGet<ShopifyProduct[]>(CATALOG_CACHE_KEY);
      if (!cached || cached.length === 0) {
        return json({ error: "Catalogo non in cache" }, { headers: HEADERS });
      }
      const matches = cached.filter(p => {
        const text = (p.title + " " + p.description + " " + p.tags.join(" ")).toLowerCase();
        return text.includes("arcade") || text.includes("console") || text.includes("super arcade");
      });
      return json({
        total_in_catalog: cached.length,
        arcade_matches: matches.length,
        matches: matches.map(p => ({
          handle: p.handle,
          title: p.title,
          vendor: p.vendor,
          price: p.price,
        })),
      }, { headers: HEADERS });
    }

    // STATUS default
    const cached = await cacheGet<ShopifyProduct[]>(CATALOG_CACHE_KEY);
    return json({
      action: "status",
      catalog_in_kv: !!cached,
      total: cached ? cached.length : 0,
      sample: cached ? cached.slice(0, 5).map(p => ({ handle: p.handle, title: p.title })) : [],
      env: {
        has_shopify_url: !!process.env.SHOPIFY_STORE_URL,
        has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
        has_kv_url: !!process.env.KV_REST_API_URL,
        has_kv_token: !!process.env.KV_REST_API_TOKEN,
      },
      instructions: {
        refresh: "?action=refresh",
        find_arcade: "?action=find_arcade",
        search: "?action=search&q=arcade,console",
      },
    }, { headers: HEADERS });
  } catch (e: any) {
    return json({ error: e?.message || "internal error" }, { status: 500, headers: HEADERS });
  }
}
