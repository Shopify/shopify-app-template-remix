import prisma, { withRetry } from "../db.server";
import { processPipeline, PipelineOperation } from "./image-suite.server";

const CHUNK_SIZE_DESCRIPTIONS = 5;
const CHUNK_SIZE_IMAGES = 2;

export async function createJob(shop: string, type: string, payload: any, totalItems: number) {
  return withRetry(() =>
    prisma.generationJob.create({
      data: { shop, type, status: "pending", totalItems, payload: JSON.stringify(payload), results: JSON.stringify([]) },
    })
  );
}

export async function getJob(id: string, shop: string) {
  return withRetry(() => prisma.generationJob.findFirst({ where: { id, shop } }));
}

export async function getJobsByShop(shop: string, limit: number = 20) {
  return withRetry(() => prisma.generationJob.findMany({ where: { shop }, orderBy: { createdAt: "desc" }, take: limit }));
}

export async function updateJobProgress(id: string, processedItems: number, successCount: number, errorCount: number, newResults: any[]) {
  const existing = await withRetry(() => prisma.generationJob.findUnique({ where: { id } }));
  if (!existing) return null;
  const existingResults = JSON.parse(existing.results || "[]");
  const combinedResults = [...existingResults, ...newResults];
  return withRetry(() =>
    prisma.generationJob.update({
      where: { id },
      data: {
        processedItems, successCount, errorCount,
        results: JSON.stringify(combinedResults),
        status: processedItems >= existing.totalItems ? "completed" : "running",
        completedAt: processedItems >= existing.totalItems ? new Date() : null,
      },
    })
  );
}

export async function markJobFailed(id: string, errorMessage: string) {
  return withRetry(() => prisma.generationJob.update({ where: { id }, data: { status: "failed", errorMessage, completedAt: new Date() } }));
}

export async function cancelJob(id: string, shop: string) {
  return withRetry(() => prisma.generationJob.updateMany({ where: { id, shop, status: { in: ["pending", "running"] } }, data: { status: "cancelled", completedAt: new Date() } }));
}

export async function processDescriptionItem(product: any, settings: any): Promise<any> {
  const { tone, framework, language, keywords, length, structure, useImage, useBarcode } = settings;
  let barcodeInfo = "";
  if (useBarcode && product.barcode) {
    try {
      const searchResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role: "user", content: `Cerca informazioni sul prodotto con codice EAN/barcode: ${product.barcode}. Il prodotto si chiama "${product.title}" del brand "${product.vendor}". Dammi una breve scheda tecnica.` }] }),
      });
      const searchData = await searchResp.json();
      barcodeInfo = searchData.content?.[0]?.text?.trim() || "";
    } catch (e) { barcodeInfo = ""; }
  }
  const prompt = buildPrompt(product, tone, framework, language, keywords, length, structure, barcodeInfo, useImage && product.image ? `\n- Immagine prodotto disponibile: ${product.image}` : "");
  try {
    const messages: any[] = [];
    if (useImage && product.image) {
      try {
        const imgResp = await fetch(product.image);
        const imgBuffer = await imgResp.arrayBuffer();
        const base64 = Buffer.from(imgBuffer).toString("base64");
        const contentType = imgResp.headers.get("content-type") || "image/jpeg";
        messages.push({ role: "user", content: [{ type: "image", source: { type: "base64", media_type: contentType.split(";")[0], data: base64 } }, { type: "text", text: prompt }] });
      } catch { messages.push({ role: "user", content: prompt }); }
    } else { messages.push({ role: "user", content: prompt }); }
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: length === "long" ? 1200 : length === "medium" ? 700 : 400, messages }),
    });
    const aiData = await aiResponse.json();
    let newDescription = aiData.content?.[0]?.text?.trim() || "";
    newDescription = newDescription.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return { id: product.id, title: product.title, image: product.image, vendor: product.vendor, price: product.price, newDescription, status: newDescription ? "success" : "error" };
  } catch (error: any) {
    return { id: product.id, title: product.title, image: product.image, vendor: product.vendor, price: product.price, newDescription: "", status: "error", error: error.message };
  }
}

function buildPrompt(product: any, tone: string, framework: string, language: string, keywords: string, length: string, structure: string, barcodeInfo: string, imageContext: string) {
  const toneMap: Record<string, string> = { professional: "Professionale e autorevole", emotional: "Emozionale e coinvolgente", technical: "Tecnico e dettagliato", luxury: "Luxury, esclusivo e raffinato", casual: "Casual e amichevole", ironic: "Ironico e originale, smart, con personalità", minimal: "Minimal e pulito, ogni parola conta" };
  const frameworkMap: Record<string, string> = { aida: "AIDA: Attenzione → Interesse → Desiderio → Azione", pas: "PAS: Problema → Agitazione → Soluzione", fab: "FAB: Feature → Advantage → Benefit", storytelling: "Storytelling: racconta una mini-storia o scenario d'uso", direct: "Diretto: vai dritto ai benefici", comparison: "Confronto: posiziona il prodotto rispetto ad alternative" };
  const langMap: Record<string, string> = { it: "italiano", en: "inglese", fr: "francese", de: "tedesco", es: "spagnolo" };
  const lengthMap: Record<string, string> = { short: "BREVE: 50-80 parole, 2-3 frasi", medium: "MEDIA: 100-150 parole, con bullet point", long: "LUNGA: 200-350 parole, descrizione completa con paragrafi, H3, bullet, CTA" };
  const structureMap: Record<string, string> = { simple: "Solo paragrafi <p>", structured: "<h3> + <p> + <ul><li>", rich: "<h3> + <h4> + <p> + <ul><li> + CTA finale in <strong>", seo_optimized: "<h3> con keyword + <p> intro + <h4> sottosezioni + <ul><li> con keyword secondarie + CTA, snippet-ready" };
  const hasDesc = product.description && product.description.length > 20;
  const cleanDesc = hasDesc ? product.description.replace(/<[^>]+>/g, "").substring(0, 600) : "";
  return `Sei un SEO specialist e copywriter e-commerce senior, specializzato in product page SEO 2026.

PRODOTTO:
- Titolo: ${product.title}
- Brand: ${product.vendor || "non specificato"}
- Categoria: ${product.productType || "non specificata"}
- Prezzo: €${product.price}
- EAN: ${product.barcode || "N/A"}${imageContext}
${cleanDesc ? `- Descrizione esistente: ${cleanDesc}` : ""}
${barcodeInfo ? `\nINFO DAL BARCODE:\n${barcodeInfo}` : ""}

CONFIGURAZIONE:
- Framework: ${frameworkMap[framework] || framework}
- Tono: ${toneMap[tone] || tone}
- Lingua: ${langMap[language] || language}
- Lunghezza: ${lengthMap[length] || length}
- Struttura HTML: ${structureMap[structure] || structure}
${keywords ? `- Keyword SEO: ${keywords}` : ""}

REGOLE SEO 2026:
1. Keyword density 3-5 per 300 parole, long-tail naturali
2. Features → Benefits concreti con numeri
3. NO parole vuote ("qualità", "il migliore", "innovativo")
4. NO "Questo prodotto" o "Il/La [nome]"
5. Titoli H3/H4 con keyword, mai "Caratteristiche"/"Descrizione"
6. Mini-FAQ finale (2 domande) per Google AI Overviews
7. Solo HTML valido, no markdown

Scrivi SOLO la descrizione HTML:`;
}

export async function processChunk(jobId: string) {
  const job = await withRetry(() => prisma.generationJob.findUnique({ where: { id: jobId } }));
  if (!job || job.status === "cancelled" || job.status === "completed" || job.status === "failed") return { done: true };
  const payload = JSON.parse(job.payload);
  const allItems = payload.products || [];
  const settings = payload.settings || {};
  const startIdx = job.processedItems;
  const chunkSize = job.type === "images" ? CHUNK_SIZE_IMAGES : CHUNK_SIZE_DESCRIPTIONS;
  const endIdx = Math.min(startIdx + chunkSize, allItems.length);
  const chunk = allItems.slice(startIdx, endIdx);
  if (chunk.length === 0) {
    await withRetry(() => prisma.generationJob.update({ where: { id: jobId }, data: { status: "completed", completedAt: new Date() } }));
    return { done: true };
  }
  if (job.status === "pending") {
    await withRetry(() => prisma.generationJob.update({ where: { id: jobId }, data: { status: "running" } }));
  }
  const processor = job.type === "images" ? processImageItem : processDescriptionItem;
  const results = await Promise.all(chunk.map((item: any) => processor(item, settings)));
  const newSuccess = results.filter((r) => r.status === "success").length;
  const newError = results.filter((r) => r.status === "error").length;
  await updateJobProgress(jobId, endIdx, job.successCount + newSuccess, job.errorCount + newError, results);
  return { done: endIdx >= allItems.length, processed: endIdx, total: allItems.length };
}

export async function processImageItem(product: any, settings: any): Promise<any> {
  const operations: PipelineOperation[] = settings.operations || [];
  const productResults: any[] = [];
  for (const img of (product.images || [])) {
    try {
      const { finalUrl, steps } = await processPipeline(img.url, operations);
      productResults.push({ originalUrl: img.url, finalUrl, steps, mediaId: img.mediaId, originalWidth: img.width, originalHeight: img.height, status: "success" });
    } catch (err: any) {
      productResults.push({ originalUrl: img.url, mediaId: img.mediaId, status: "error", error: err.message });
    }
  }
  return { productId: product.id, title: product.title, images: productResults, status: productResults.some((r: any) => r.status === "success") ? "success" : "error" };
}
