import prisma from "../db.server";
import fs from "fs";
import path from "path";

export type TagValue = {
  value: string;
  description: string;
};

export type TagGroup = {
  prefix: string;
  label: string;
  description: string;
  values: TagValue[];
};

export type Taxonomy = {
  version: number;
  updatedAt: string;
  description: string;
  groups: TagGroup[];
};

const FALLBACK_PATH = path.join(process.cwd(), "data", "tag-taxonomy.json");

/**
 * Carica la tassonomia dal DB. Se non esiste, la inizializza dal file JSON fallback.
 */
export async function loadTaxonomy(shop: string): Promise<Taxonomy> {
  const record = await prisma.tagTaxonomy.findUnique({ where: { shop } });
  if (record) {
    try {
      return JSON.parse(record.data) as Taxonomy;
    } catch (e) {
      console.error("[Taxonomy] Parse error, using fallback", e);
    }
  }
  // Primo uso: carica dal file e salva nel DB
  const fallback = loadFallbackTaxonomy();
  await saveTaxonomy(shop, fallback);
  return fallback;
}

/**
 * Salva la tassonomia nel DB (upsert). Incrementa automaticamente la versione.
 */
export async function saveTaxonomy(shop: string, taxonomy: Taxonomy): Promise<void> {
  const existing = await prisma.tagTaxonomy.findUnique({ where: { shop } });
  const newVersion = existing ? existing.version + 1 : 1;
  const data = JSON.stringify({ ...taxonomy, version: newVersion, updatedAt: new Date().toISOString() });
  
  await prisma.tagTaxonomy.upsert({
    where: { shop },
    create: { shop, data, version: newVersion },
    update: { data, version: newVersion },
  });
}

function loadFallbackTaxonomy(): Taxonomy {
  try {
    const raw = fs.readFileSync(FALLBACK_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[Taxonomy] Cannot load fallback JSON", e);
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      description: "Fallback vuoto",
      groups: [],
    };
  }
}

/**
 * Restituisce la lista piatta di tutti i tag "prefisso:valore"
 */
export function flattenTaxonomy(taxonomy: Taxonomy): string[] {
  const tags: string[] = [];
  for (const group of taxonomy.groups) {
    for (const v of group.values) {
      tags.push(`${group.prefix}:${v.value}`);
    }
  }
  return tags;
}

/**
 * Valida che un tag esista nella tassonomia.
 */
export function isValidTag(tag: string, taxonomy: Taxonomy): boolean {
  return flattenTaxonomy(taxonomy).includes(tag);
}

/**
 * Filtra un array di tag mantenendo solo quelli validi.
 */
export function filterValidTags(tags: string[], taxonomy: Taxonomy): string[] {
  const valid = new Set(flattenTaxonomy(taxonomy));
  return tags.filter(t => valid.has(t));
}

/**
 * Rimuove tutti i tag SKU:* da un array di tag.
 */
export function stripSkuTags(tags: string[]): string[] {
  return tags.filter(t => !t.toLowerCase().startsWith("sku:"));
}

/**
 * Raggruppa un array di tag per prefisso (per mostrarli nella UI).
 */
export function groupTagsByPrefix(tags: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const tag of tags) {
    const idx = tag.indexOf(":");
    if (idx > 0) {
      const prefix = tag.substring(0, idx);
      const value = tag.substring(idx + 1);
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(value);
    } else {
      if (!groups["_other"]) groups["_other"] = [];
      groups["_other"].push(tag);
    }
  }
  return groups;
}
