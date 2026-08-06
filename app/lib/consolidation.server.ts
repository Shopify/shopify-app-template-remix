// app/lib/consolidation.server.ts
// 32 CONCEPT STORE — Product Consolidation (Step 1+2, read-only).
import sharp from "sharp";
import prisma from "../db.server";

// Session-based Admin GraphQL client (the object returned by
// authenticate.admin(request).admin). We use this instead of a raw env-token
// fetch so the scan authenticates exactly like the rest of the app and does
// not depend on SHOPIFY_ACCESS_TOKEN being present in the environment.
export type AdminClient = {
  graphql: (query: string, options?: { variables?: Record<string, any> }) => Promise<Response>;
};

const PRODUCTS_PER_PAGE = 25;

async function adminQuery<T = any>(admin: AdminClient, query: string, variables: Record<string, any> = {}): Promise<T> {
  const resp = await admin.graphql(query, { variables });
  const body: any = await resp.json();
  if (body.errors) throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  if (!body.data) throw new Error("Admin GraphQL returned no data");
  return body.data as T;
}

// ── dHash 64-bit via sharp (robusto a 1 o 3 canali) ──
export async function computeImageHash(imageUrl: string): Promise<string> {
  const resp = await fetch(imageUrl, { signal: AbortSignal.timeout(3000) });
  if (!resp.ok) throw new Error(`image fetch ${resp.status}`);
  const inputBuf = Buffer.from(await resp.arrayBuffer());
  const W = 9, H = 8;
  const { data, info } = await sharp(inputBuf).greyscale().resize(W, H, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const px = (r: number, c: number) => data[(r * W + c) * ch];
  let bits = "";
  for (let r = 0; r < H; r++) for (let c = 0; c < W - 1; c++) bits += px(r, c) < px(r, c + 1) ? "1" : "0";
  let hex = "";
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.substring(i, i + 4), 2).toString(16);
  return hex;
}

export function hammingDistanceHex(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) { let x = parseInt(a[i], 16) ^ parseInt(b[i], 16); while (x) { dist += x & 1; x >>= 1; } }
  return dist;
}

// ── Dizionari taglia/colore ──
const SIZE_WORDS = ["XXXL", "XXL", "3XL", "2XL", "XXS", "XS", "XL", "S", "M", "L"];
const MULTIWORD_COLORS = ["brilliant blue", "navy blue", "dark brown", "light blue"];
const COLOR_MAP: Record<string, string> = {
  nero: "Nero", black: "Nero", bianco: "Bianco", white: "Bianco",
  rosso: "Rosso", red: "Rosso", blu: "Blu", blue: "Blu", navy: "Blu Navy", "navy blue": "Blu Navy",
  "brilliant blue": "Brilliant Blue", "light blue": "Azzurro", verde: "Verde", green: "Verde",
  giallo: "Giallo", yellow: "Giallo", rosa: "Rosa", pink: "Rosa",
  grigio: "Grigio", grey: "Grigio", gray: "Grigio",
  marrone: "Marrone", brown: "Marrone", "dark brown": "Marrone",
  beige: "Beige", panna: "Panna", crema: "Crema", arancione: "Arancione", orange: "Arancione",
  viola: "Viola", purple: "Viola", oro: "Oro", gold: "Oro", argento: "Argento", silver: "Argento",
  fucsia: "Fucsia", celeste: "Celeste", turchese: "Turchese",
};

export function collapseRepeats(s: string): string {
  // "BLACK/BLACK/BLACK/BLACK" -> "BLACK" (Danea ripete il campo colore)
  return s.replace(/\b([A-Za-zÀ-ÿ]+)([/\-,]\s*\1\b)+/gi, "$1");
}

export function detectSize(title: string): string | null {
  // Tolgo gli apostrofi (così "M'AMA" non genera una falsa taglia "M") e la punteggiatura.
  const t = " " + collapseRepeats(title).toUpperCase().replace(/['’]/g, "").replace(/[.,]/g, " ") + " ";
  // I centimetri (es. piatti "18 CM", "26 CM") sono la taglia: vanno rilevati per primi.
  const cm = t.match(/\b(\d{1,3})\s*CM\b/);
  if (cm) return `${cm[1]} cm`;
  const range = t.match(/\b(\d{2})\s*-\s*(\d{2})\b/);
  if (range) return `${range[1]}-${range[2]}`;
  const single = t.match(/\b(3[5-9]|4[0-8])\b/);
  if (single) return single[1];
  for (const sz of SIZE_WORDS) if (new RegExp(`\\b${sz}\\b`).test(t)) return sz;
  return null;
}

export function detectColor(title: string): string | null {
  const norm = collapseRepeats(title).toLowerCase();
  for (const mw of MULTIWORD_COLORS) if (norm.includes(mw)) return COLOR_MAP[mw];
  for (const w of norm.replace(/[/.,-]/g, " ").split(/\s+/)) if (COLOR_MAP[w]) return COLOR_MAP[w];
  return null;
}

export function normalizeTitle(title: string): string {
  let s = collapseRepeats(title).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  for (const mw of MULTIWORD_COLORS) s = s.replace(new RegExp(mw.toUpperCase(), "g"), " ");
  for (const key of Object.keys(COLOR_MAP)) s = s.replace(new RegExp(`\\b${key.toUpperCase()}\\b`, "g"), " ");
  s = s.replace(/\b\d{2}\s*-\s*\d{2}\b/g, " ").replace(/\b(3[5-9]|4[0-8])\b/g, " ");
  for (const sz of SIZE_WORDS) s = s.replace(new RegExp(`\\b${sz}\\b`, "g"), " ");
  s = s.replace(/[^A-Z0-9\s]/g, " ").replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

export function bucketKey(vendor: string, titleNorm: string): string {
  return `${(vendor || "").trim().toUpperCase()}::${titleNorm}`;
}

// ── Scan worker (batched, time-limited) ──
export async function createScan(shop: string, vendorFilter?: string): Promise<number> {
  const scan = await prisma.consolidationScan.create({ data: { shop, status: "queued", vendorFilter: vendorFilter || null } });
  return scan.id;
}

export async function processScanBatch(admin: AdminClient, scanId: number, maxRuntimeMs = 40 * 1000): Promise<{ done: boolean; scanned: number }> {
  const start = Date.now();
  const scan = await prisma.consolidationScan.findUnique({ where: { id: scanId } });
  if (!scan) throw new Error(`scan ${scanId} not found`);
  if (scan.status === "completed" || scan.status === "failed") return { done: true, scanned: 0 };
  if (scan.status === "queued") await prisma.consolidationScan.update({ where: { id: scanId }, data: { status: "running", startedAt: new Date() } });
  const shop = scan.shop;
  const qParts = ["status:active"];
  if (scan.vendorFilter) qParts.push(`vendor:"${scan.vendorFilter.replace(/"/g, "")}"`);
  const queryStr = qParts.join(" ");
  const PRODUCTS_QUERY = `
    query($cursor: String, $q: String!) {
      products(first: ${PRODUCTS_PER_PAGE}, after: $cursor, query: $q) {
        pageInfo { hasNextPage endCursor }
        edges { cursor node {
          id title vendor productType status
          featuredImage { url }
          variants(first: 1) { edges { node { sku price inventoryQuantity barcode } } }
        }}
      }
    }`;
  let cursor = scan.cursor || null;
  let scannedThisRun = 0;
  let hasNext = true;
  let timedOut = false;
  while (hasNext && !timedOut) {
    // Se nel frattempo la scansione è stata fermata, esci subito.
    const fresh = await prisma.consolidationScan.findUnique({ where: { id: scanId }, select: { status: true } });
    if (!fresh || (fresh.status !== "running" && fresh.status !== "queued")) {
      return { done: true, scanned: scannedThisRun };
    }
    const data: any = await adminQuery(admin, PRODUCTS_QUERY, { cursor, q: queryStr });
    const conn = data.products;
    for (const edge of conn.edges || []) {
      const n = edge.node;
      const imageUrl = n.featuredImage?.url || "";
      const v0 = n.variants?.edges?.[0]?.node || {};
      let imageHash = "";
      if (imageUrl) { try { imageHash = await computeImageHash(imageUrl); } catch { imageHash = ""; } }
      const titleNorm = normalizeTitle(n.title || "");
      const key = bucketKey(n.vendor || "", titleNorm);
      await prisma.consolidationCandidate.upsert({
        where: { shop_productId: { shop, productId: n.id } },
        create: { shop, productId: n.id, productTitle: n.title || "", vendor: n.vendor || "", productType: n.productType || "", sku: v0.sku || "", barcode: v0.barcode || "", imageUrl, imageHash, titleNormalized: titleNorm, detectedSize: detectSize(n.title || ""), detectedColor: detectColor(n.title || ""), bucketKey: key, status: "pending" },
        update: { productTitle: n.title || "", vendor: n.vendor || "", productType: n.productType || "", sku: v0.sku || "", barcode: v0.barcode || "", imageUrl, imageHash, titleNormalized: titleNorm, detectedSize: detectSize(n.title || ""), detectedColor: detectColor(n.title || ""), bucketKey: key, scannedAt: new Date() },
      });
      scannedThisRun++;
      cursor = edge.cursor; // checkpoint a livello di singolo prodotto: il progresso non si perde mai
      if (Date.now() - start > maxRuntimeMs) { timedOut = true; break; }
    }
    if (!timedOut) {
      cursor = conn.pageInfo.endCursor;
      hasNext = conn.pageInfo.hasNextPage;
      await prisma.consolidationScan.update({ where: { id: scanId }, data: { cursor, totalScanned: scan.totalScanned + scannedThisRun } });
      if (hasNext) await new Promise((r) => setTimeout(r, 200)); // margine rate-limit Shopify
    }
  }
  if (timedOut) {
    await prisma.consolidationScan.update({ where: { id: scanId }, data: { cursor, totalScanned: scan.totalScanned + scannedThisRun } });
    return { done: false, scanned: scannedThisRun };
  }
  await prisma.consolidationScan.update({ where: { id: scanId }, data: { status: "completed", completedAt: new Date(), cursor, totalScanned: scan.totalScanned + scannedThisRun } });
  return { done: true, scanned: scannedThisRun };
}

// ── Lettura gruppi per la dashboard ──
export type CandidateGroup = {
  bucketKey: string; vendor: string; titleNormalized: string;
  count: number; hashConsistent: boolean; members: any[];
};

export async function getGroups(shop: string, minSize = 2): Promise<CandidateGroup[]> {
  const candidates = await prisma.consolidationCandidate.findMany({ where: { shop, status: "pending" }, orderBy: { bucketKey: "asc" } });
  const map = new Map<string, any[]>();
  for (const c of candidates) { if (!map.has(c.bucketKey)) map.set(c.bucketKey, []); map.get(c.bucketKey)!.push(c); }
  const groups: CandidateGroup[] = [];
  for (const [key, members] of map.entries()) {
    if (members.length < minSize) continue;
    const withHash = members.filter((m) => m.imageHash);
    let consistent = true;
    if (withHash.length >= 2) { const ref = withHash[0].imageHash; consistent = withHash.every((m) => hammingDistanceHex(ref, m.imageHash) <= 10); }
    groups.push({ bucketKey: key, vendor: members[0].vendor, titleNormalized: members[0].titleNormalized, count: members.length, hashConsistent: consistent, members });
  }
  groups.sort((a, b) => b.count - a.count);
  return groups;
}

// Dismiss a false-positive group: mark its pending candidates as rejected so
// they drop out of the dashboard. Stays rejected across re-scans (the scan
// upsert never resets status on update).
export async function ignoreGroup(shop: string, bucketKey: string): Promise<number> {
  const res = await prisma.consolidationCandidate.updateMany({
    where: { shop, bucketKey, status: "pending" },
    data: { status: "rejected" },
  });
  return res.count;
}

// Ferma una scansione bloccata/in corso: la porta in stato terminale così non
// viene più ripresa dal worker e la UI si sblocca.
export async function cancelScan(shop: string, scanId?: number): Promise<number> {
  const res = await prisma.consolidationScan.updateMany({
    where: scanId
      ? { id: scanId, shop, status: { in: ["queued", "running"] } }
      : { shop, status: { in: ["queued", "running"] } },
    data: { status: "cancelled", completedAt: new Date() },
  });
  return res.count;
}

export async function getLatestScan(shop: string) {
  return prisma.consolidationScan.findFirst({ where: { shop }, orderBy: { createdAt: "desc" } });
}
