import prisma from "../db.server";
import { generateTagsForProduct } from "./ai-tagger.server";
import { loadTaxonomy, stripSkuTags } from "./taxonomy.server";

export type CreateJobInput = {
  shop: string;
  kind: "generate" | "push" | "bulk_remove" | "cleanup_sku";
  productIds: string[];
  options?: Record<string, any>;
};

/**
 * Crea un nuovo TagJob nella queue.
 */
export async function createTagJob(input: CreateJobInput): Promise<number> {
  const job = await prisma.tagJob.create({
    data: {
      shop: input.shop,
      kind: input.kind,
      totalItems: input.productIds.length,
      productIds: JSON.stringify(input.productIds),
      options: input.options ? JSON.stringify(input.options) : null,
      status: "queued",
    },
  });
  return job.id;
}

/**
 * Processa il prossimo batch di un job. Chiamato dal worker (API route).
 * Ha un tempo massimo (4 min) prima di fermarsi e lasciare che un altro
 * trigger riprenda.
 */
export async function processNextBatch(
  jobId: number,
  maxRuntimeMs: number = 4 * 60 * 1000
): Promise<{ done: boolean; processed: number; remaining: number }> {
  const startTime = Date.now();

  const job = await prisma.tagJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job ${jobId} not found`);
  if (job.status === "completed" || job.status === "failed") {
    return { done: true, processed: 0, remaining: 0 };
  }

  // Marca come running se era queued
  if (job.status === "queued") {
    await prisma.tagJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });
  }

  const allProductIds: string[] = JSON.parse(job.productIds);
  const remainingProductIds = allProductIds.slice(job.processedItems);
  const options = job.options ? JSON.parse(job.options) : {};

  let processed = 0;
  let success = 0;
  let failed = 0;
  const errors: Array<{ productId: string; error: string }> = [];

  for (const productId of remainingProductIds) {
    if (Date.now() - startTime > maxRuntimeMs) {
      // Time-up, salva progressi e si ferma
      await prisma.tagJob.update({
        where: { id: jobId },
        data: {
          processedItems: job.processedItems + processed,
          successItems: job.successItems + success,
          failedItems: job.failedItems + failed,
        },
      });
      return {
        done: false,
        processed,
        remaining: remainingProductIds.length - processed,
      };
    }

    try {
      switch (job.kind) {
        case "generate":
          await handleGenerate(job.shop, productId, options);
          break;
        case "push":
          await handlePush(job.shop, productId);
          break;
        case "bulk_remove":
          await handleBulkRemove(job.shop, productId, options);
          break;
        case "cleanup_sku":
          await handleCleanupSku(job.shop, productId);
          break;
      }
      success++;
    } catch (err: any) {
      failed++;
      errors.push({
        productId,
        error: err.message || String(err).substring(0, 200),
      });
    }
    processed++;

    // Pausa per rate-limit Shopify (2 req/sec base, 400ms margine)
    await sleep(400);
  }

  // Fine job
  const existingErrors = job.errorLog ? JSON.parse(job.errorLog) : [];
  const allErrors = [...existingErrors, ...errors];

  await prisma.tagJob.update({
    where: { id: jobId },
    data: {
      processedItems: job.processedItems + processed,
      successItems: job.successItems + success,
      failedItems: job.failedItems + failed,
      status: "completed",
      completedAt: new Date(),
      errorLog: allErrors.length > 0 ? JSON.stringify(allErrors) : null,
    },
  });

  return { done: true, processed, remaining: 0 };
}

// ====================================================
// HANDLERS per i diversi kind di job
// ====================================================

/**
 * GENERATE: chiama l'AI per generare i tag e salva il draft.
 */
async function handleGenerate(
  shop: string,
  productId: string,
  options: Record<string, any>
): Promise<void> {
  const taxonomy = await loadTaxonomy(shop);
  const product = await fetchProduct(shop, productId);

  const result = await generateTagsForProduct({
    productId,
    title: product.title,
    vendor: product.vendor,
    productType: product.productType,
    description: product.description,
    existingTags: product.tags,
    taxonomy,
  });

  // Salva draft (sempre cancella SKU dai previousTags quando genera)
  const previousTags = stripSkuTags(product.tags);

  await prisma.productTagDraft.upsert({
    where: { shop_productId: { shop, productId } },
    create: {
      shop,
      productId,
      productTitle: product.title,
      previousTags: JSON.stringify(previousTags),
      proposedTags: JSON.stringify(result.proposedTags),
      status: "pending",
      source: "ai",
    },
    update: {
      productTitle: product.title,
      previousTags: JSON.stringify(previousTags),
      proposedTags: JSON.stringify(result.proposedTags),
      status: "pending",
      source: "ai",
    },
  });
}

/**
 * PUSH: prende i draft "pending" e li committa su Shopify.
 */
async function handlePush(shop: string, productId: string): Promise<void> {
  const draft = await prisma.productTagDraft.findUnique({
    where: { shop_productId: { shop, productId } },
  });
  if (!draft || draft.status !== "pending") {
    throw new Error(`Draft non trovato o non pending per ${productId}`);
  }

  const proposedTags: string[] = JSON.parse(draft.proposedTags);

  // PUT su Shopify REST API - rimuove SKU: sempre
  const finalTags = stripSkuTags(proposedTags);

  await updateProductTags(shop, productId, finalTags);

  await prisma.productTagDraft.update({
    where: { id: draft.id },
    data: { status: "committed", committedAt: new Date() },
  });
}

/**
 * BULK_REMOVE: rimuove tag specificati (options.tagsToRemove) dal prodotto.
 */
async function handleBulkRemove(
  shop: string,
  productId: string,
  options: Record<string, any>
): Promise<void> {
  const tagsToRemove: string[] = options.tagsToRemove || [];
  if (tagsToRemove.length === 0) return;

  const product = await fetchProduct(shop, productId);
  const newTags = product.tags.filter(t => !tagsToRemove.includes(t));

  await updateProductTags(shop, productId, newTags);
}

/**
 * CLEANUP_SKU: rimuove tutti i tag SKU:* dal prodotto.
 */
async function handleCleanupSku(shop: string, productId: string): Promise<void> {
  const product = await fetchProduct(shop, productId);
  const newTags = stripSkuTags(product.tags);

  // Solo se ci sono SKU da rimuovere
  if (newTags.length < product.tags.length) {
    await updateProductTags(shop, productId, newTags);
  }
}

// ====================================================
// Shopify API wrappers (usano GraphQL Admin API)
// ====================================================

type ShopifyProduct = {
  id: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
};

async function fetchProduct(shop: string, productId: string): Promise<ShopifyProduct> {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN env var not set");

  const numericId = productId.replace(/\D/g, "");
  const gid = `gid://shopify/Product/${numericId}`;

  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        vendor
        productType
        tags
        description
      }
    }
  `;

  const resp = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables: { id: gid } }),
  });

  if (!resp.ok) {
    throw new Error(`fetchProduct HTTP ${resp.status}`);
  }

  const data: any = await resp.json();
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  if (!data.data?.product) {
    throw new Error(`Product ${productId} not found`);
  }

  const p = data.data.product;
  return {
    id: p.id,
    title: p.title || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: p.tags || [],
    description: p.description || "",
  };
}

async function updateProductTags(
  shop: string,
  productId: string,
  newTags: string[]
): Promise<void> {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN env var not set");

  const numericId = productId.replace(/\D/g, "");
  const gid = `gid://shopify/Product/${numericId}`;

  const mutation = `
    mutation updateProductTags($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id tags }
        userErrors { field message }
      }
    }
  `;

  const resp = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input: { id: gid, tags: newTags } },
    }),
  });

  if (!resp.ok) {
    throw new Error(`updateProductTags HTTP ${resp.status}`);
  }

  const data: any = await resp.json();
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  const userErrors = data.data?.productUpdate?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(`userErrors: ${JSON.stringify(userErrors)}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
