// ═══════════════════════════════════════════════════════════════════════
//  /api/gift-suggest.js — Endpoint AI per Gift Finder v3
//  ─────────────────────────────────────────────────────────────────────
//  Dove metterlo nel progetto Vercel:
//    Se usi Remix: app/routes/api.gift-suggest.jsx (vedi sotto)
//    Se usi Next.js/API routes: /api/gift-suggest.js (questo file)
//
//  Env var necessaria su Vercel:
//    ANTHROPIC_API_KEY = sk-ant-...
// ═══════════════════════════════════════════════════════════════════════

// ─── VERSIONE NEXT.JS / API ROUTES VERCEL ────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, products, context } = req.body;

  if (!prompt || !products || products.length === 0) {
    return res.status(400).json({ error: 'Missing prompt or products' });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Build product list for Claude (minimal, cost-effective)
  const productList = products.slice(0, 50).map((p, i) => (
    `${i + 1}. "${p.title}" — ${p.vendor} — €${p.price} — ${p.tags || ''}`
  )).join('\n');

  const systemPrompt = `Sei il personal shopper AI di 32 Concept Store, un negozio di regali a Bari.
L'utente ha già filtrato i prodotti e ora ti chiede un consiglio personalizzato.

Il tuo compito:
1. Leggi la descrizione del destinatario
2. Scegli i 6 prodotti PIÙ ADATTI dalla lista
3. Per ognuno scrivi una motivazione breve e personale (1 frase, max 20 parole)

RISPONDI SOLO in JSON, nessun altro testo:
[
  {"index": 1, "reason": "Perfetto per chi ama cucinare con stile"},
  {"index": 5, "reason": "Il design minimal che cerca"},
  ...
]

"index" è il numero del prodotto nella lista (1-based).
Scegli ESATTAMENTE 6 prodotti. Se non ne trovi 6 adatti, scegline meno ma mai più di 6.`;

  const contextStr = context
    ? `Filtri scelti: ${Object.entries(context).map(([k,v]) => `${k}=${v}`).join(', ')}`
    : '';

  const userPrompt = `${contextStr}

Descrizione del destinatario: "${prompt}"

Prodotti disponibili:
${productList}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', response.status, err);
      return res.status(502).json({ error: 'AI service error', picks: [] });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '[]';
    const clean = text.replace(/^```json\s*|\s*```$/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(clean); }
    catch { return res.status(200).json({ picks: [] }); }

    // Map back to product data
    const picks = parsed
      .filter(p => p.index && p.index <= products.length)
      .slice(0, 6)
      .map(p => {
        const prod = products[p.index - 1];
        return {
          title: prod.title,
          vendor: prod.vendor,
          price: prod.price,
          image: prod.image || '',
          url: prod.url || '',
          reason: p.reason || ''
        };
      });

    return res.status(200).json({ picks });

  } catch (err) {
    console.error('Gift suggest error:', err);
    return res.status(500).json({ error: 'Internal error', picks: [] });
  }
}


// ═══════════════════════════════════════════════════════════════════════
//  VERSIONE REMIX (se il tuo progetto usa Remix)
//  Salva come: app/routes/api.gift-suggest.jsx
// ═══════════════════════════════════════════════════════════════════════
/*
import { json } from "@remix-run/node";

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const { prompt, products, context } = await request.json();

  if (!prompt || !products?.length) {
    return json({ error: "Missing data", picks: [] }, { status: 400 });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return json({ error: "API key missing", picks: [] }, { status: 500 });
  }

  const productList = products.slice(0, 50).map((p, i) =>
    `${i + 1}. "${p.title}" — ${p.vendor} — €${p.price} — ${p.tags || ""}`
  ).join("\n");

  const systemPrompt = `Sei il personal shopper AI di 32 Concept Store, un negozio di regali a Bari.
L'utente ha già filtrato i prodotti e ora ti chiede un consiglio personalizzato.
Scegli i 6 prodotti PIÙ ADATTI dalla lista.
Per ognuno scrivi una motivazione breve (1 frase, max 20 parole).
RISPONDI SOLO in JSON:
[{"index": 1, "reason": "..."}, ...]
"index" è il numero nella lista (1-based). Max 6.`;

  const contextStr = context
    ? `Filtri: ${Object.entries(context).map(([k,v]) => `${k}=${v}`).join(", ")}`
    : "";

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: `${contextStr}\n\nDestinatario: "${prompt}"\n\nProdotti:\n${productList}` }],
      }),
    });

    if (!resp.ok) {
      return json({ error: "AI error", picks: [] }, { status: 502 });
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text?.trim() || "[]";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    const picks = parsed
      .filter((p) => p.index && p.index <= products.length)
      .slice(0, 6)
      .map((p) => {
        const prod = products[p.index - 1];
        return { title: prod.title, vendor: prod.vendor, price: prod.price, image: prod.image, url: prod.url, reason: p.reason };
      });

    return json({ picks }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error(err);
    return json({ error: "Internal error", picks: [] }, { status: 500 });
  }
}

export async function loader() {
  return json({ status: "Gift Suggest API ready" });
}
*/
