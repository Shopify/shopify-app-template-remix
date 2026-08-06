// app/lib/consolidation-merge.server.ts
// Merge engine — Step 3-4. buildMergePlan is read-only (dry-run);
// executeMerge performs the real Shopify mutations.
import prisma from "../db.server";
import type { AdminClient } from "./consolidation.server";

export type PlanVariant = {
  productId: string;
  sku: string;
  barcode: string;
  title: string;
  size: string | null;
  color: string | null;
  optionValues: { name: string; value: string }[];
  imageUrl: string;
  isMaster: boolean;
};

export type MergePlan = {
  bucketKey: string;
  vendor: string;
  masterProductId: string;
  masterTitle: string;
  featuredImageUrl: string;
  options: { name: string; values: string[] }[];
  variants: PlanVariant[];
  archiveProductIds: string[];
  skuMapping: Record<string, string>;
  warnings: string[];
};

export type MergeOptions = {
  featuredImageUrl?: string;
  masterTitle?: string;
  overrides?: Record<string, { size?: string; color?: string }>;
};

export type ExecuteResult = {
  ok: boolean;
  masterProductId: string;
  createdVariants: number;
  archived: number;
  warnings: string[];
  errors: string[];
};

const FALLBACK_SIZE = "Unica";
const FALLBACK_COLOR = "Unico";

function clean(s?: string | null): string {
  return (s || "").trim();
}

export async function buildMergePlan(
  shop: string,
  productIds: string[],
  masterProductId: string,
  opts: MergeOptions = {},
): Promise<MergePlan> {
  const overrides = opts.overrides || {};
  const members = await prisma.consolidationCandidate.findMany({
    where: { shop, productId: { in: productIds }, status: "pending" },
    orderBy: { productTitle: "asc" },
  });

  const warnings: string[] = [];
  if (members.length < 2) warnings.push("Il gruppo ha meno di 2 prodotti.");
  if (members.length > 0 && !members.some((m) => m.productId === masterProductId)) {
    warnings.push("Master non valido per questo gruppo; uso il primo prodotto.");
    masterProductId = members[0].productId;
  }

  const sizeOf = (m: { productId: string; detectedSize: string | null }) => clean(overrides[m.productId]?.size) || m.detectedSize || null;
  const colorOf = (m: { productId: string; detectedColor: string | null }) => clean(overrides[m.productId]?.color) || m.detectedColor || null;

  const hasSize = members.some((m) => sizeOf(m));
  const hasColor = members.some((m) => colorOf(m));
  if (!hasSize && !hasColor) {
    warnings.push("Nessuna taglia/colore (rilevata o inserita): impossibile creare varianti distinte.");
  }

  const usedCombos = new Map<string, string>();
  const variants: PlanVariant[] = members.map((m) => {
    const optionValues: { name: string; value: string }[] = [];
    if (hasColor) optionValues.push({ name: "Colore", value: colorOf(m) || FALLBACK_COLOR });
    if (hasSize) optionValues.push({ name: "Taglia", value: sizeOf(m) || FALLBACK_SIZE });
    const combo = optionValues.map((o) => o.value).join(" / ");
    if (usedCombos.has(combo)) {
      warnings.push(`Combinazione duplicata "${combo}": ${usedCombos.get(combo)} e ${m.sku || m.productTitle}. Vanno in conflitto.`);
    } else {
      usedCombos.set(combo, m.sku || m.productTitle);
    }
    return {
      productId: m.productId,
      sku: m.sku || "",
      barcode: m.barcode || "",
      title: m.productTitle,
      size: sizeOf(m),
      color: colorOf(m),
      optionValues,
      imageUrl: m.imageUrl || "",
      isMaster: m.productId === masterProductId,
    };
  });

  // Order each option's values with the master's value first, so after
  // productOptionsCreate (LEAVE_AS_IS) the master variant already has the
  // correct combination and the new variants never collide with it.
  const masterVar = variants.find((v) => v.isMaster);
  const orderedValues = (name: string): string[] => {
    const all = [...new Set(variants.map((v) => v.optionValues.find((o) => o.name === name)!.value))];
    const mv = masterVar?.optionValues.find((o) => o.name === name)?.value;
    return mv ? [mv, ...all.filter((x) => x !== mv)] : all;
  };
  const options: { name: string; values: string[] }[] = [];
  if (hasColor) options.push({ name: "Colore", values: orderedValues("Colore") });
  if (hasSize) options.push({ name: "Taglia", values: orderedValues("Taglia") });

  const master = members.find((m) => m.productId === masterProductId);
  const skuMapping: Record<string, string> = {};
  for (const v of variants) if (v.sku) skuMapping[v.sku] = v.optionValues.map((o) => o.value).join(" / ");

  return {
    bucketKey: members[0]?.bucketKey || "",
    vendor: master?.vendor || members[0]?.vendor || "",
    masterProductId,
    masterTitle: clean(opts.masterTitle) || master?.productTitle || "",
    featuredImageUrl: opts.featuredImageUrl || master?.imageUrl || "",
    options,
    variants,
    archiveProductIds: members.filter((m) => m.productId !== masterProductId).map((m) => m.productId),
    skuMapping,
    warnings,
  };
}

// ── Execute (mutating) ──────────────────────────────────────────────────────
async function gql<T = any>(admin: AdminClient, query: string, variables: Record<string, any> = {}): Promise<T> {
  const resp = await admin.graphql(query, { variables });
  const body: any = await resp.json();
  if (body.errors) throw new Error(`GraphQL: ${JSON.stringify(body.errors)}`);
  return body.data as T;
}

function pushErrors(into: string[], userErrors: any[] | undefined, label: string): boolean {
  const errs = userErrors || [];
  for (const e of errs) into.push(`${label}: ${e.message}${e.field ? ` (${Array.isArray(e.field) ? e.field.join(".") : e.field})` : ""}`);
  return errs.length > 0;
}

const FRESH_QUERY = `
  query MergeFresh($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        variants(first: 1) { nodes { id sku barcode price } }
      }
    }
  }`;

export async function executeMerge(
  admin: AdminClient,
  shop: string,
  productIds: string[],
  masterProductId: string,
  opts: MergeOptions = {},
): Promise<ExecuteResult> {
  const result: ExecuteResult = { ok: false, masterProductId, createdVariants: 0, archived: 0, warnings: [], errors: [] };
  try {
    const plan = await buildMergePlan(shop, productIds, masterProductId, opts);
    masterProductId = plan.masterProductId;
    result.masterProductId = masterProductId;

    if (plan.variants.length < 2) { result.errors.push("Servono almeno 2 prodotti selezionati."); return result; }
    if (plan.options.length === 0) { result.errors.push("Nessuna taglia/colore: impossibile creare varianti."); return result; }
    const combos = new Set<string>();
    for (const v of plan.variants) {
      const c = v.optionValues.map((o) => o.value).join("§");
      if (combos.has(c)) { result.errors.push(`Combinazione duplicata (${c}): risolvila prima di procedere.`); return result; }
      combos.add(c);
    }

    // Pre-flight: l'inventario è obbligatorio (altrimenti si perde stock).
    // Se non è accessibile (scope mancanti), interrompo PRIMA di ogni modifica.
    let locationId: string | undefined;
    try {
      const loc = await gql(admin, `{ locations(first: 1) { nodes { id } } }`);
      locationId = loc.locations?.nodes?.[0]?.id;
    } catch (e: any) {
      result.errors.push(`Inventario non accessibile (${e.message}). Aggiungi all'app gli scope read_locations, read_inventory, write_inventory e ri-autorizza, poi riprova. NESSUNA modifica effettuata.`);
      return result;
    }
    if (!locationId) { result.errors.push("Nessuna location trovata: impossibile trasferire le giacenze. Nessuna modifica effettuata."); return result; }

    const fresh = await gql(admin, FRESH_QUERY, { ids: plan.variants.map((v) => v.productId) });
    const byId: Record<string, any> = {};
    for (const n of fresh.nodes || []) if (n?.id) byId[n.id] = n;
    // Read the EAN live from Shopify (not the possibly-stale scan data).
    const freshBarcode = (pid: string): string => byId[pid]?.variants?.nodes?.[0]?.barcode || "";
    const masterNode = byId[masterProductId];
    if (!masterNode) { result.errors.push("Prodotto master non trovato su Shopify."); return result; }
    const masterVariant = masterNode.variants?.nodes?.[0];
    const masterPlan = plan.variants.find((v) => v.isMaster);

    // 1) Optional master title change
    const newTitle = clean(opts.masterTitle);
    if (newTitle && newTitle !== masterNode.title) {
      const d = await gql(admin, `mutation($input: ProductInput!){ productUpdate(input:$input){ userErrors{ field message } } }`, { input: { id: masterProductId, title: newTitle } });
      pushErrors(result.warnings, d.productUpdate?.userErrors, "titolo");
    }

    // 2) Create options (master variant keeps its current combo = master's, since values are ordered master-first)
    const optionsInput = plan.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: v })) }));
    const oc = await gql(admin, `
      mutation($productId: ID!, $options: [OptionCreateInput!]!, $strategy: ProductOptionCreateVariantStrategy) {
        productOptionsCreate(productId: $productId, options: $options, variantStrategy: $strategy) {
          userErrors { field message code }
        }
      }`, { productId: masterProductId, options: optionsInput, strategy: "LEAVE_AS_IS" });
    if (pushErrors(result.errors, oc.productOptionsCreate?.userErrors, "opzioni")) { result.errors.push("Creazione opzioni fallita: interrotto (nessuna variante creata, nessun prodotto archiviato)."); return result; }

    // 3) Align the master's existing variant's option values. Its photo is
    // already the product image, so we don't re-add it (avoids duplicate media).
    if (masterVariant && masterPlan) {
      const mu = await gql(admin, `
        mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } }
        }`, {
        productId: masterProductId,
        variants: [{
          id: masterVariant.id,
          optionValues: masterPlan.optionValues.map((o) => ({ optionName: o.name, name: o.value })),
        }],
      });
      pushErrors(result.warnings, mu.productVariantsBulkUpdate?.userErrors, "variante master");
    }

    // 4) Create the slave variants (SKU + EAN + price; per-variant photo only
    // when the images actually differ — otherwise the single product image is fine)
    const slaves = plan.variants.filter((v) => !v.isMaster);
    const imagesVary = new Set(plan.variants.map((v) => v.imageUrl).filter(Boolean)).size > 1;
    const variantsInput = slaves.map((v) => ({
      optionValues: v.optionValues.map((o) => ({ optionName: o.name, name: o.value })),
      price: byId[v.productId]?.variants?.nodes?.[0]?.price,
      ...(freshBarcode(v.productId) ? { barcode: freshBarcode(v.productId) } : {}),
      inventoryItem: { sku: v.sku || undefined },
    }));
    const bc = await gql(admin, `
      mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants { id sku selectedOptions { name value } inventoryItem { id } }
          userErrors { field message }
        }
      }`, { productId: masterProductId, variants: variantsInput });
    if (pushErrors(result.errors, bc.productVariantsBulkCreate?.userErrors, "varianti")) { result.errors.push("Creazione varianti fallita: interrotto PRIMA dell'archiviazione (gli slave restano attivi)."); return result; }
    const created: any[] = bc.productVariantsBulkCreate?.productVariants || [];
    result.createdVariants = created.length;

    // 4a) Explicitly set each created variant's EAN/barcode (reliable path,
    // not relying only on the create input). Needs the EAN in the scan data.
    const barcodeUpdates: { id: string; barcode: string }[] = [];
    for (const cv of created) {
      const src = slaves.find((s) => s.sku === cv.sku);
      const ean = src ? freshBarcode(src.productId) : "";
      if (cv.id && ean) barcodeUpdates.push({ id: cv.id, barcode: ean });
    }
    if (barcodeUpdates.length) {
      const bu = await gql(admin, `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId: $productId, variants: $variants){ userErrors { field message } } }`, { productId: masterProductId, variants: barcodeUpdates });
      pushErrors(result.warnings, bu.productVariantsBulkUpdate?.userErrors, "EAN varianti");
    }

    // 4b) Attach a per-variant image when images differ: create the media on the
    // product, wait until READY, then link each variant to its media id.
    if (imagesVary) {
      try {
        const wanted: { variantId: string; url: string }[] = [];
        if (masterVariant?.id && masterPlan?.imageUrl) wanted.push({ variantId: masterVariant.id, url: masterPlan.imageUrl });
        for (const cv of created) { const src = slaves.find((s) => s.sku === cv.sku); if (cv.id && src?.imageUrl) wanted.push({ variantId: cv.id, url: src.imageUrl }); }

        const med = await gql(admin, `query($id: ID!){ product(id: $id){ media(first: 100){ nodes { id status ... on MediaImage { image { url } } } } } }`, { id: masterProductId });
        const urlToMediaId = new Map<string, string>();
        for (const n of med.product?.media?.nodes || []) { if (n?.image?.url && n?.id) urlToMediaId.set(n.image.url, n.id); }

        const distinctUrls = [...new Set(wanted.map((w) => w.url))];
        const missing = distinctUrls.filter((u) => !urlToMediaId.has(u));
        const newIds: string[] = [];
        if (missing.length) {
          const cm = await gql(admin, `mutation($productId: ID!, $media: [CreateMediaInput!]!){ productCreateMedia(productId: $productId, media: $media){ media { id } mediaUserErrors { field message } } }`, { productId: masterProductId, media: missing.map((u) => ({ originalSource: u, mediaContentType: "IMAGE" })) });
          pushErrors(result.warnings, cm.productCreateMedia?.mediaUserErrors, "media");
          const cmedia = cm.productCreateMedia?.media || [];
          missing.forEach((u, i) => { const id = cmedia[i]?.id; if (id) { urlToMediaId.set(u, id); newIds.push(id); } });
        }

        // Wait for new media to be READY (Shopify rejects attaching non-ready media)
        if (newIds.length) {
          for (let attempt = 0; attempt < 8; attempt++) {
            const st = await gql(admin, `query($ids: [ID!]!){ nodes(ids: $ids){ ... on MediaImage { id status } } }`, { ids: newIds });
            if ((st.nodes || []).every((n: any) => !n || n.status === "READY" || n.status === "FAILED")) break;
            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        const variantMedia = wanted
          .map((w) => ({ variantId: w.variantId, mediaIds: urlToMediaId.has(w.url) ? [urlToMediaId.get(w.url) as string] : [] }))
          .filter((vm) => vm.mediaIds.length);
        if (variantMedia.length) {
          const am = await gql(admin, `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!){ productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia){ userErrors { field message } } }`, { productId: masterProductId, variantMedia });
          pushErrors(result.warnings, am.productVariantAppendMedia?.userErrors, "immagini varianti");
        }
      } catch (e: any) {
        result.warnings.push(`Immagini varianti non applicate (${e.message}).`);
      }
    }

    // 5) Trasferisce le giacenze per variante (location già verificata sopra)
    let inventoryTransferred = false;
    try {
      const invq = await gql(admin, `query($ids: [ID!]!){ nodes(ids: $ids){ ... on Product { id variants(first: 1){ nodes { sku inventoryQuantity inventoryItem { id } } } } } }`, { ids: plan.variants.map((v) => v.productId) });
      const invById: Record<string, any> = {};
      for (const n of invq.nodes || []) if (n?.id) invById[n.id] = n?.variants?.nodes?.[0];
      const quantities: any[] = [];
      const masterInv = invById[masterProductId];
      if (masterInv?.inventoryItem?.id && masterInv?.inventoryQuantity != null) quantities.push({ inventoryItemId: masterInv.inventoryItem.id, locationId, quantity: masterInv.inventoryQuantity });
      const qtyBySku: Record<string, number> = {};
      for (const v of slaves) { if (v.sku) qtyBySku[v.sku] = invById[v.productId]?.inventoryQuantity ?? 0; }
      for (const cv of created) { const q = qtyBySku[cv.sku]; if (cv.inventoryItem?.id && q != null) quantities.push({ inventoryItemId: cv.inventoryItem.id, locationId, quantity: q }); }
      if (quantities.length) {
        const inv = await gql(admin, `mutation($input: InventorySetQuantitiesInput!){ inventorySetQuantities(input: $input){ userErrors { field message } } }`, { input: { name: "available", reason: "correction", ignoreCompareQuantity: true, quantities } });
        inventoryTransferred = !pushErrors(result.errors, inv.inventorySetQuantities?.userErrors, "giacenze");
      } else {
        inventoryTransferred = true; // nessuna giacenza da trasferire
      }
    } catch (e: any) {
      result.errors.push(`Trasferimento giacenze fallito (${e.message}).`);
    }

    // 6) Audit mapping metafield danea.sku_mapping (best effort)
    const mapping: Record<string, any> = {};
    if (masterPlan?.sku) mapping[masterPlan.sku] = { ean: freshBarcode(masterProductId), options: masterPlan.optionValues.map((o) => o.value).join(" / "), variantId: masterVariant?.id || "" };
    for (const cv of created) { const src = slaves.find((s) => s.sku === cv.sku); if (cv.sku) mapping[cv.sku] = { ean: src ? freshBarcode(src.productId) : "", options: (cv.selectedOptions || []).map((o: any) => o.value).join(" / "), variantId: cv.id }; }
    const mf = await gql(admin, `
      mutation($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { field message } }
      }`, { metafields: [{ ownerId: masterProductId, namespace: "danea", key: "sku_mapping", type: "json", value: JSON.stringify(mapping) }] });
    pushErrors(result.warnings, mf.metafieldsSet?.userErrors, "metafield");

    // 7) Archivia gli slave SOLO se le giacenze sono state trasferite (così non resta stock intrappolato)
    if (inventoryTransferred) {
      for (const pid of plan.archiveProductIds) {
        const a = await gql(admin, `mutation($input: ProductInput!){ productUpdate(input:$input){ userErrors{ field message } } }`, { input: { id: pid, status: "ARCHIVED" } });
        if (!pushErrors(result.errors, a.productUpdate?.userErrors, `archivio ${pid}`)) result.archived++;
      }
    } else {
      result.warnings.push("Slave NON archiviati: giacenze non trasferite, lascio attivi gli originali per non perdere stock. Sistema le giacenze e archivia a mano, oppure rimuovi le varianti create.");
    }

    // 8) Mark candidates merged
    await prisma.consolidationCandidate.updateMany({ where: { shop, productId: { in: plan.variants.map((v) => v.productId) } }, data: { status: "merged" } });

    result.ok = result.errors.length === 0;
    return result;
  } catch (e: any) {
    result.errors.push(`Errore: ${e.message || String(e)}`);
    return result;
  }
}
