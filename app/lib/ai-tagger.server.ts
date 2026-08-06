import Anthropic from "@anthropic-ai/sdk";
import type { Taxonomy } from "./taxonomy.server";
import { flattenTaxonomy, filterValidTags, stripSkuTags } from "./taxonomy.server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-haiku-4-5-20251001";

export type TagGenerationInput = {
  productId: string;
  title: string;
  vendor?: string;
  productType?: string;
  description?: string;
  existingTags?: string[];
  taxonomy: Taxonomy;
};

export type TagGenerationResult = {
  productId: string;
  proposedTags: string[];
  reasoning: string;
  rawResponse: string;
};

/**
 * Usa Claude Haiku per generare i tag strutturati per un singolo prodotto,
 * SCEGLIENDO SOLO dalla tassonomia fornita. Cancella tutti i tag SKU:*.
 */
export async function generateTagsForProduct(
  input: TagGenerationInput
): Promise<TagGenerationResult> {
  const { productId, title, vendor, productType, description, taxonomy } = input;

  const allowedTags = flattenTaxonomy(taxonomy);
  const taxonomyDescription = buildTaxonomyDescription(taxonomy);

  const cleanDescription = stripHtml(description || "").substring(0, 800);

  const systemPrompt = `Sei un classificatore esperto di prodotti e-commerce per "32 Concept Store", un concept store italiano che vende oggetti di design, cartoleria, borse, gadget tech, giochi, profumi, idee regalo e articoli per la casa.

Il tuo unico compito è: analizzare un prodotto e assegnare i tag più appropriati scegliendoli ESCLUSIVAMENTE dalla tassonomia fornita.

REGOLE:
1. Scegli SOLO tag dalla lista permessa. MAI inventare tag nuovi.
2. Restituisci un JSON con schema: {"tags": ["prefix:value", ...], "reasoning": "breve motivazione"}
3. Assegna da 3 a 8 tag per prodotto, mai meno di 3 se possibile.
4. SEMPRE almeno 1 tag del prefisso "per:" (destinatario).
5. SEMPRE almeno 1 tag del prefisso "stile:" (estetica).
6. Aggiungi tag "occ:" solo se il prodotto è CHIARAMENTE pertinente a quella occasione.
7. Aggiungi tag "micro:" solo se il prodotto è SPECIFICAMENTE dedicato (es: mug "mamma" → micro:mamma).
8. NON aggiungere tag generici solo per riempire - la precisione è più importante della quantità.
9. NON includere tag "SKU:*" nella risposta (verranno cancellati).`;

  const userPrompt = `TASSONOMIA PERMESSA:
${taxonomyDescription}

PRODOTTO:
- Titolo: ${title}
- Brand: ${vendor || "n/d"}
- Categoria: ${productType || "n/d"}
- Descrizione: ${cleanDescription || "nessuna descrizione"}

Restituisci SOLO il JSON, senza backtick né altro testo. Formato:
{"tags": ["per:donna", "stile:elegante", "occ:compleanno"], "reasoning": "Prodotto elegante femminile..."}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    // Clean response da eventuali backtick markdown
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: { tags: string[]; reasoning: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error(`Parse JSON fallito: ${cleaned.substring(0, 200)}`);
    }

    if (!parsed.tags || !Array.isArray(parsed.tags)) {
      throw new Error(`Formato risposta invalido: manca array 'tags'`);
    }

    // Validazione: solo tag dalla tassonomia, no SKU
    const proposedTags = filterValidTags(stripSkuTags(parsed.tags), taxonomy);

    return {
      productId,
      proposedTags,
      reasoning: parsed.reasoning || "",
      rawResponse: rawText,
    };
  } catch (error: any) {
    throw new Error(
      `Claude API error per prodotto ${productId}: ${error.message || error}`
    );
  }
}

/**
 * Costruisce una descrizione testuale della tassonomia per il prompt AI.
 */
function buildTaxonomyDescription(taxonomy: Taxonomy): string {
  const lines: string[] = [];
  for (const group of taxonomy.groups) {
    lines.push(`\n## ${group.label} (prefisso "${group.prefix}:")`);
    lines.push(`${group.description}`);
    for (const v of group.values) {
      lines.push(`  - ${group.prefix}:${v.value} → ${v.description}`);
    }
  }
  return lines.join("\n");
}

/**
 * Rimuove HTML da una stringa.
 */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
