# Magic AI Agent — Tags Manager

Nuova feature per la Shopify app Magic AI Agent che permette CRUD completo sui tag
prodotto con generazione AI basata su una tassonomia configurabile.

## 🎯 Cosa fa

- **Tab Prodotti**: lista paginata con filtri (status, brand, missing tags, ricerca), selezione
  persistente multi-page, bulk actions (genera AI, push pending, pulisci SKU, reset tag)
- **Tab Tassonomia**: editor JSON + anteprima dei tag definiti, modificabile dall'admin UI
- **Tab Jobs**: coda dei lavori asincroni in corso, con progress bar e log errori

## 🔒 Safety

- **SKU: sempre rimossi** in ogni generazione AI
- **Modalità draft**: l'AI scrive in una tabella `ProductTagDraft`, poi un secondo comando
  pusha su Shopify (così si ha preview prima di committare)
- **Previous tags salvati** nel DB prima di modificare (per eventuale undo)
- **Worker timeout-aware**: ogni batch dura max 4 minuti, poi si ferma e aspetta il prossimo
  trigger (evita timeout Vercel)
- **Validazione tag**: l'AI può usare SOLO tag definiti nella tassonomia, niente invenzioni

---

## 📥 Installazione nel repo `shopify-app-template-remix`

### Step 1 — Copia i file

Copia i file nelle posizioni corrispondenti nel tuo repo:

```
shopify-app-template-remix/
├── app/
│   ├── lib/
│   │   ├── taxonomy.server.ts           ← nuovo
│   │   ├── ai-tagger.server.ts          ← nuovo
│   │   └── tag-jobs.server.ts           ← nuovo
│   └── routes/
│       ├── app.tags.tsx                 ← nuovo (UI principale)
│       ├── api.tags.products.tsx        ← nuovo (lista prodotti)
│       ├── api.tags.vendors.tsx         ← nuovo (dropdown brand)
│       ├── api.tags.taxonomy.tsx        ← nuovo (CRUD tassonomia)
│       ├── api.tags.manual.tsx          ← nuovo (modifica manuale singola)
│       ├── api.tags.jobs.tsx            ← nuovo (lista job)
│       ├── api.tags.jobs.create.tsx     ← nuovo (crea job)
│       ├── api.tags.jobs.process.tsx    ← nuovo (worker)
│       └── api.tags.jobs.$id.tsx        ← nuovo (singolo job)
├── data/
│   └── tag-taxonomy.json                ← nuovo (vocabolario iniziale)
└── prisma/
    └── schema.prisma                    ← MODIFICARE (vedi Step 2)
```

### Step 2 — Aggiungi i modelli Prisma

Apri `prisma/schema.prisma` e aggiungi in fondo i 3 modelli dal file
`schema-additions.prisma` (TagTaxonomy, ProductTagDraft, TagJob).

Poi esegui:

```bash
npx prisma migrate dev --name add_tags_manager
npx prisma generate
```

### Step 3 — Aggiungi la voce al menu della app

Apri il tuo `app/routes/app.tsx` (o dove hai il layout) e aggiungi il link al Tags Manager nella nav:

```tsx
<Link to="/app/tags">Tags Manager</Link>
```

### Step 4 — Variabili d'ambiente

Assicurati di avere in `.env` (e su Vercel Environment Variables):

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
SHOPIFY_ACCESS_TOKEN=shpat_... (se fetchi direttamente da worker - opzionale)
TAG_JOB_WORKER_TOKEN=un_token_segreto_random (opzionale, per cron esterni)
```

### Step 5 — Installazione dipendenze

Il codice usa `@anthropic-ai/sdk` che probabilmente hai già dalla feature descriptions.
In caso contrario:

```bash
npm install @anthropic-ai/sdk
```

### Step 6 — Deploy su Vercel

```bash
git add .
git commit -m "feat: tags manager with AI generation"
git push
```

Vercel farà auto-deploy.

### Step 7 — (opzionale) Cron per elaborare i job in background

Aggiungi `vercel.json` nel root del repo (o aggiorna quello esistente):

```json
{
  "crons": [
    {
      "path": "/api/tags/jobs/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Questo invoca il worker ogni 5 minuti. Se hai già delle cron per altre feature, aggiungi solo
la riga qui dentro alla lista esistente.

---

## 🔄 Workflow utente tipo

### Scenario: tag tutti i prodotti "draft" con AI

1. Apri Tags Manager → Tab **Prodotti**
2. Filtro Status = "Draft" + Filtro "Solo senza tag strutturati" = ON
3. Click **"Seleziona tutti in questa pagina"** → poi "Avanti" → seleziona ancora → ecc.
   (la selezione è persistente multi-page)
4. Click **"Genera tag con AI"** → si crea un TagJob di tipo "generate"
5. Vai al Tab **Jobs** → vedi la progress bar del job in corso
6. Quando il job è "completed", torna al Tab **Prodotti**: i prodotti avranno un badge
   **"X tag pending"** nella colonna Pending
7. Rivedi i tag proposti (puoi vederli scorrendo la tabella)
8. Seleziona di nuovo i prodotti da committare → **"Pusha pending su Shopify"**
9. Un secondo TagJob di tipo "push" esegue le PUT su Shopify

### Scenario: pulisci tag SKU: da tutti i prodotti

1. Filtro = nessuno (tutti i prodotti)
2. Click "Seleziona tutti in questa pagina" su più pagine
3. Click **"Pulisci tag SKU:"**
4. Si crea un TagJob di tipo "cleanup_sku" che rimuove tutti i tag SKU:* dai prodotti
   selezionati **direttamente su Shopify**

### Scenario: modifica tassonomia

1. Apri Tags Manager → Tab **Tassonomia**
2. Vedi anteprima dei gruppi attuali + editor JSON sotto
3. Modifica il JSON (aggiungi/rimuovi gruppi o valori, aggiorna le descrizioni per l'AI)
4. Click **"Salva tassonomia"**
5. La nuova versione è immediatamente disponibile per i prossimi job AI

---

## 🧠 Architettura riassunta

```
┌────────────────────────────────────────────────────────────┐
│   UI /app/tags (Polaris tabs)                              │
└───────────┬────────────────┬────────────────┬──────────────┘
            │                │                │
            ↓                ↓                ↓
     /api/tags/products  /api/tags/taxonomy  /api/tags/jobs
     (GraphQL Admin)     (CRUD Prisma)       (lista + worker)
            │                                 │
            ↓                                 ↓
        Shopify API                    /api/tags/jobs/create
                                              │
                                              ↓
                                       TagJob DB record
                                              │
                                              ↓ (cron /5 min)
                                       /api/tags/jobs/process
                                              │
                                              ↓
                                       tag-jobs.server.ts
                                        │
                                        ↓
                               [ai-tagger.server.ts]
                                        │
                                        ↓
                                   Claude Haiku
                                        │
                                        ↓
                                ProductTagDraft
                                (pending)
                                        │
                                        ↓ (commit/push)
                                  Shopify API PUT
```

---

## ⚠️ Note e limitazioni

- **Neon cold start**: primi call dopo inattività possono fallire. Il worker ritenta automaticamente.
- **Claude rate limit**: se processi >100 prodotti/min potresti beccare 429. Il worker include una pausa di 400ms tra prodotti.
- **Vercel timeout**: le funzioni hanno timeout 300s (Free) o 900s (Pro). Il worker si ferma a 4 min per stare largo.
- **Selezione persistente**: funziona finché non ricarichi la pagina. Se cambi i filtri, la selezione viene mantenuta ma i prodotti visibili cambiano.
- **Tassonomia con caratteri speciali**: se includi `à è é ù` (es: `micro:papà`), Shopify li accetta ma fai attenzione alle regole smart collection che devono matchare esattamente.
- **Undo non implementato nella UI**: i `previousTags` sono salvati in `ProductTagDraft`, ma la funzione undo UI può essere aggiunta in seguito se serve.

---

## 🧪 Testing consigliato

1. **Primo test**: modalità "draft" — genera tag per 5-10 prodotti, controlla i draft, pusha, verifica su Shopify admin.
2. **Stress test**: seleziona 500 prodotti → genera AI. Vedi che il worker processa a batch senza timeout.
3. **Cleanup SKU**: seleziona 50 prodotti con molti tag SKU:, esegui "Pulisci SKU:", verifica su Shopify.
4. **Rollback test**: se qualcosa va storto, i `previousTags` nel DB permettono di scrivere uno script manuale di restore.

---

## 📝 TODO futuri (eventuali)

- UI per vedere il diff (tag attuali vs proposti) prima del push
- Pulsante "Undo" per ripristinare previousTags
- Import/export tassonomia come file JSON
- Report CSV dei tag per analisi
- Supporto per tag metafield (oltre ai tag base)
- Preset di filtri salvabili (es: "tutti i draft senza tag")
