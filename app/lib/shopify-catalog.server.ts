// app/lib/shopify-catalog.server.ts
// 32 CONCEPT STORE — Helper Shopify con full-text search

const DEFAULT_STORE = "https://32conceptstore.it";

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: string;
  compareAtPrice?: string;
  available: boolean;
  imageUrl?: string;
  url: string;
}

function getStoreUrl(): string {
  return (process.env.SHOPIFY_STORE_URL || DEFAULT_STORE).replace(/\/$/, "");
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function mapProduct(raw: any): ShopifyProduct {
  const v0 = raw.variants?.[0] || {};
  const price = v0.price ?? raw.price ?? raw.price_min ?? "0";
  const compareAt = v0.compare_at_price ?? raw.compare_at_price ?? null;
  const image =
    raw.featured_image?.src ||
    raw.featured_image ||
    raw.image?.src ||
    raw.images?.[0]?.src ||
    raw.images?.[0] ||
    "";

  return {
    id: String(raw.id || ""),
    handle: String(raw.handle || ""),
    title: String(raw.title || ""),
    description: stripHtml(raw.body_html || raw.description || "").slice(0, 500),
    vendor: String(raw.vendor || ""),
    productType: String(raw.product_type || ""),
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? String(raw.tags).split(",").map((t: string) => t.trim()) : []),
    price: parseFloat(String(price)).toFixed(2),
    compareAtPrice: compareAt ? parseFloat(String(compareAt)).toFixed(2) : undefined,
    available: raw.available !== false,
    imageUrl: image ? (image.startsWith("//") ? "https:" + image : image) : undefined,
    url: "/products/" + raw.handle,
  };
}

export async function loadFullCatalog(): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  const maxPages = 50;
  let page = 1;
  let consecutiveEmpty = 0;

  while (page <= maxPages && consecutiveEmpty < 2) {
    try {
      const url = getStoreUrl() + "/products.json?limit=250&page=" + page;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) break;
      const data = await res.json();
      const items = data?.products || [];

      if (items.length === 0) {
        consecutiveEmpty++;
        page++;
        continue;
      }
      consecutiveEmpty = 0;
      const mapped = items.filter((p: any) => p.available !== false).map(mapProduct);
      allProducts.push(...mapped);

      if (items.length < 250) break;
      page++;
    } catch (e) {
      console.warn("loadFullCatalog page error:", e);
      break;
    }
  }

  console.log("[catalog] Loaded " + allProducts.length + " products from " + page + " pages");
  return allProducts;
}

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchableText(p: ShopifyProduct): string {
  return normalize([
    p.title,
    p.description,
    p.vendor,
    p.productType,
    ...(p.tags || []),
  ].join(" "));
}

export interface SearchOptions {
  catalog: ShopifyProduct[];
  queries: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export function searchInCatalog(opts: SearchOptions): ShopifyProduct[] {
  const { catalog, queries, minPrice, maxPrice, limit = 12 } = opts;
  if (!catalog?.length || !queries?.length) return [];

  const normalizedQueries = queries
    .map(q => normalize(q))
    .filter(q => q.length >= 2);

  if (!normalizedQueries.length) return [];

  const scored: Array<{ product: ShopifyProduct; score: number }> = [];

  for (const product of catalog) {
    if (minPrice != null && parseFloat(product.price) < minPrice) continue;
    if (maxPrice != null && parseFloat(product.price) > maxPrice) continue;

    const text = buildSearchableText(product);
    const titleNorm = normalize(product.title);
    let score = 0;

    for (const q of normalizedQueries) {
      if (titleNorm.includes(q)) score += 10;
      if (text.includes(q)) score += 3;
      const words = q.split(" ").filter(w => w.length >= 3);
      for (const w of words) {
        if (titleNorm.includes(w)) score += 2;
        else if (text.includes(w)) score += 1;
      }
    }

    if (score > 0) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

export async function getCollectionProducts(
  handle: string,
  limit: number = 50
): Promise<{ collection: { title: string; description: string } | null; products: ShopifyProduct[] }> {
  if (!handle) return { collection: null, products: [] };

  const cap = Math.min(limit, 250);
  const url = getStoreUrl() + "/collections/" + encodeURIComponent(handle) + "/products.json?limit=" + cap;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { collection: null, products: [] };
    const data = await res.json();
    const rawProducts = data?.products || [];
    const products = rawProducts
      .filter((p: any) => p.available !== false)
      .map(mapProduct);

    let collection: { title: string; description: string } | null = null;
    try {
      const collRes = await fetch(getStoreUrl() + "/collections/" + handle + ".json", { headers: { Accept: "application/json" } });
      if (collRes.ok) {
        const collData = await collRes.json();
        if (collData?.collection) {
          collection = {
            title: String(collData.collection.title || handle),
            description: stripHtml(collData.collection.body_html || "").slice(0, 300),
          };
        }
      }
    } catch (e) {}

    if (!collection) collection = { title: handle, description: "" };
    return { collection, products };
  } catch (e) {
    console.error("getCollectionProducts error:", e);
    return { collection: null, products: [] };
  }
}

export async function searchInCollection(
  collectionHandle: string,
  keyword: string = "",
  limit: number = 12,
  minPrice?: number,
  maxPrice?: number
): Promise<ShopifyProduct[]> {
  const { products } = await getCollectionProducts(collectionHandle, 100);
  let filtered = products;

  if (keyword) {
    filtered = searchInCatalog({ catalog: products, queries: [keyword], minPrice, maxPrice, limit: 100 });
  } else {
    if (minPrice != null) filtered = filtered.filter((p) => parseFloat(p.price) >= minPrice);
    if (maxPrice != null) filtered = filtered.filter((p) => parseFloat(p.price) <= maxPrice);
  }
  return filtered.slice(0, limit);
}

export function compressProductForAI(p: ShopifyProduct): string {
  const desc = p.description.slice(0, 100);
  return "[" + p.handle + "] " + p.title + " | " + (p.vendor || "—") + " | €" + p.price + (desc ? " | " + desc : "");
}

export function compressProductsForAI(products: ShopifyProduct[]): string {
  return products.map(compressProductForAI).join("\n");
}

export function getRandomSample(catalog: ShopifyProduct[], count: number = 50): ShopifyProduct[] {
  if (!catalog?.length) return [];
  const arr = [...catalog];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
