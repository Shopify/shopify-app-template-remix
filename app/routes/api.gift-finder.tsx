// app/routes/api.gift-finder.tsx
//
// 32 CONCEPT STORE — Gift Finder AI Personal Shopper Endpoint
// ─────────────────────────────────────────────────────────────────
// Path: app/routes/api.gift-finder.tsx (nel repo magic-ai-agent)
// URL pubblico: https://magic-ai-agent.vercel.app/api/gift-finder
//
// Riceve dal frontend Liquid:
//   { history: [{role, content}, ...], shop: "https://..." }
//
// Ritorna:
//   {
//     message: "testo risposta",
//     product_queries: ["query 1", "query 2"],   // per Shopify Search API
//     suggestions: ["Altro suggerimento", ...]   // chip cliccabili
//   }
//
// Variabili d'ambiente richieste su Vercel:
//   ANTHROPIC_API_KEY=sk-ant-...
//
// CORS: il dominio del Shopify storefront fa fetch verso Vercel,
// quindi serve abilitare CORS.

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 800;

// CORS headers — apri al tuo dominio Shopify
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// ═════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — istruzioni al personal shopper
// ═════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Sei il personal shopper AI di **32 Concept Store**, un negozio italiano che vende oggetti di design, regali curiosi e accessori (con sede a Bari). Il tuo ruolo è aiutare i clienti a trovare il regalo perfetto.

# Tono di voce
- Caldo, amichevole, mai formale o distaccato
- Risposte SEMPRE in italiano
- Brevi e chiare: massimo 3-4 frasi per messaggio
- Usa emoji con parsimonia (1 ogni tanto, non in ogni risposta)

# Catalogo 32 Concept Store
Le categorie principali sono:
1. **Pelletteria & Accessori** — borse, zaini, portafogli, beauty case, trolley
2. **Scrittura & Cancelleria** — penne (anche di lusso tipo Lamy), matite, agende, planner, quaderni
3. **Casa & Design** — lampade, tazze, piatti, bicchieri, decorazioni, piante, cornici, profumi, candele
4. **Natale** — decorazioni, calendari avvento, idee festive
5. **Hi-Tech** — speaker, cuffie, sveglie smart, lampade smart
6. **Giochi** — paperelle da collezione, peluche, giochi creativi e da tavolo
7. **Abbigliamento** — t-shirt, felpe, abbigliamento bambini
8. **Idee Regalo** — collezioni dedicate per compleanno, laurea, nascita, anniversario, festa mamma, festa papà

I brand più rappresentati: Legami, EDG, Egan, Lamy, Seletti, Moulin Roty, Yankee Candle, 24Bottles, Moleskine, Ichendorf, Kikkerland, Goofi, Piattini d'Avanguardia.

# Come rispondi
1. Se l'utente NON ha dato dettagli sufficienti (manca destinatario / occasione / budget / interessi), fai UNA SOLA domanda alla volta in modo naturale.
2. Quando hai abbastanza info, suggerisci 2-3 idee concrete in formato breve, e includi parole-chiave per il motore di ricerca prodotti.

# Formato risposta — molto importante
Rispondi SEMPRE con un blocco JSON valido tra \`\`\`json e \`\`\`, così:

\`\`\`json
{
  "message": "Testo amichevole della tua risposta. Può contenere **grassetto** e link [come questo](/collections/handle).",
  "product_queries": ["query specifica 1", "query specifica 2"],
  "suggestions": ["Suggerimento rapido 1", "Suggerimento rapido 2"]
}
\`\`\`

Dove:
- **message**: testo conversazionale visibile all'utente. Italiano, 2-4 frasi. Puoi linkare collezioni con [testo](/collections/handle).
- **product_queries**: array di 1-3 stringhe specifiche da cercare nel catalogo (es. "candela profumata vaniglia", "agenda 2026 fiori", "paperella batman"). Lascia vuoto [] se stai ancora chiedendo info.
- **suggestions**: 2-4 chip cliccabili con suggerimenti per la prossima domanda dell'utente. Lascia vuoto [] se non rilevanti.

# Esempi di product_queries efficaci
- Utente vuole regalo per mamma 60 anni che ama profumi → ["candela profumata", "diffusore ambiente", "profumo casa"]
- Utente cerca regalo bimbo 5 anni → ["peluche", "gioco creativo bambino", "paperella collezione"]
- Utente cerca penna di lusso per laurea → ["penna lusso", "lamy", "moleskine penna"]

# Collezioni linkabili (handle)
- /collections/festa-mamma
- /collections/festa-papa
- /collections/compleanno
- /collections/laurea
- /collections/anniversario-matrimonio
- /collections/idee-regalo-nascita
- /collections/penne
- /collections/peluche-pupazzi
- /collections/profumi-candele
- /collections/quaderni-agende-planner
- /collections/borse-e-zaini
- /collections/tazze-piatti-bicchieri
- /collections/lampade-e-luci
- /collections/decorazioni-piante
- /collections/speaker-cuffie

NON inventare handle che non esistono. Se non sei sicuro, ometti il link.

# Comportamento
- NON proporre prodotti che non sono in 32 Concept Store (no elettronica grande, no abbigliamento adulti tecnico, no cibo, no piante vere).
- Se l'utente chiede qualcosa fuori catalogo, suggerisci con grazia un'alternativa che hai.
- Se il budget è basso (sotto 20€) suggerisci candele piccole, paperelle, quaderni, gadget cancelleria.
- Se è alto (sopra 100€) suggerisci penne Lamy, borse, lampade design, profumi premium.
- Per le occasioni con collezione dedicata (festa mamma, papà, laurea, ecc.) linka SEMPRE la collezione nel message.

Ricorda: rispondi SEMPRE e SOLO con il JSON, nient'altro.`;

// ═════════════════════════════════════════════════════════════════
// PARSE JSON da risposta Claude (gestisce code fence)
// ═════════════════════════════════════════════════════════════════
function extractJSON(text: string): any {
  // Prova prima a estrarre il blocco ```json ... ```
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (e) {
      // continua sotto
    }
  }
  // Fallback: prova a parsare l'intera stringa
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // ultimo tentativo: cerca un oggetto { } valido
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
  }
  return null;
}

// ═════════════════════════════════════════════════════════════════
// OPTIONS (preflight CORS)
// ═════════════════════════════════════════════════════════════════
export async function loader() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ═════════════════════════════════════════════════════════════════
// POST handler
// ═════════════════════════════════════════════════════════════════
export async function action({ request }: ActionFunctionArgs) {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405, headers: CORS_HEADERS }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      { error: "Server misconfigured: ANTHROPIC_API_KEY missing" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const history: Array<{ role: string; content: string }> = body.history || [];
  if (!Array.isArray(history) || history.length === 0) {
    return json(
      { error: "Missing or invalid history" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Limita la history a max 20 messaggi per contenere i costi
  const trimmed = history.slice(-20);

  // Mappa al formato Anthropic
  const messages = trimmed
    .filter((m) => m && m.role && m.content)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 2000), // safety cap
    }));

  try {
    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return json(
        { error: `AI service error: ${anthropicRes.status}` },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await anthropicRes.json();
    const rawText =
      (data.content && data.content[0] && data.content[0].text) || "";

    if (!rawText) {
      return json(
        { error: "Empty AI response" },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    // Estrai JSON dalla risposta
    const parsed = extractJSON(rawText);

    if (!parsed) {
      // Fallback: il modello non ha rispettato il formato
      return json(
        {
          message: rawText,
          product_queries: [],
          suggestions: [],
        },
        { headers: CORS_HEADERS }
      );
    }

    return json(
      {
        message: parsed.message || "",
        product_queries: Array.isArray(parsed.product_queries)
          ? parsed.product_queries.slice(0, 3)
          : [],
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.slice(0, 4)
          : [],
      },
      { headers: CORS_HEADERS }
    );
  } catch (e: any) {
    console.error("Gift finder error:", e);
    return json(
      { error: e?.message || "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
