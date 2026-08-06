import { useState, useCallback, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Select,
  TextField,
  Badge,
  Banner,
  Box,
  IndexTable,
  useIndexResourceState,
  Thumbnail,
  EmptyState,
  Tabs,
  Checkbox,
  Divider,
  Pagination,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

const PRODUCTS_PER_PAGE = 100;

// ── LOADER ───────────────────────────────────────────────────
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const statusFilter = url.searchParams.get("status") || "ACTIVE";
  const direction = url.searchParams.get("direction") || "next";
  const onlyMissing = url.searchParams.get("missing") === "true";

  // Combina filtri: status + missing description
  const statusQueryMap: Record<string, string> = {
    ACTIVE: "status:active",
    DRAFT: "status:draft",
    ARCHIVED: "status:archived",
    ALL: "",
  };
  const statusQuery = statusQueryMap[statusFilter] || "status:active";
  const missingQuery = onlyMissing ? "-description:*" : "";
  const filterQuery = [statusQuery, missingQuery].filter(Boolean).join(" ");
  console.log('[DEBUG LOADER] status:', statusFilter, 'onlyMissing:', onlyMissing, 'filterQuery:', filterQuery);

  let query: string;

  if (cursor && direction === "next") {
    query = `#graphql
      query getProducts($cursor: String!) {
        products(first: ${PRODUCTS_PER_PAGE}, after: $cursor, sortKey: CREATED_AT, reverse: true${filterQuery ? `, query: "${filterQuery}"` : ""}) {
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              tags
              descriptionHtml
              featuredMedia { preview { image { url altText } } }
              variants(first: 1) { edges { node { price barcode sku title } } }
              media(first: 5) { edges { node { preview { image { url altText width height } } } } }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }`;
  } else if (cursor && direction === "prev") {
    query = `#graphql
      query getProducts($cursor: String!) {
        products(last: ${PRODUCTS_PER_PAGE}, before: $cursor, sortKey: CREATED_AT, reverse: true${filterQuery ? `, query: "${filterQuery}"` : ""}) {
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              tags
              descriptionHtml
              featuredMedia { preview { image { url altText } } }
              variants(first: 1) { edges { node { price barcode sku title } } }
              media(first: 5) { edges { node { preview { image { url altText width height } } } } }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }`;
  } else {
    query = `#graphql
      query getProducts {
        products(first: ${PRODUCTS_PER_PAGE}, sortKey: CREATED_AT, reverse: true${filterQuery ? `, query: "${filterQuery}"` : ""}) {
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              tags
              descriptionHtml
              featuredMedia { preview { image { url altText } } }
              variants(first: 1) { edges { node { price barcode sku title } } }
              media(first: 5) { edges { node { preview { image { url altText width height } } } } }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }`;
  }

  const variables = cursor ? { cursor } : {};
  console.log('[DEBUG QUERY]', query.substring(0, 300));
  const response = await admin.graphql(query, { variables });
  const responseJson = await response.json();
  console.log('[DEBUG RESPONSE] products count:', responseJson.data?.products?.edges?.length);

  // Conta totale prodotti
  const countResp = await admin.graphql(`#graphql
    query { productsCount { count } }`);
  const countJson = await countResp.json();
  const totalProducts = countJson.data?.productsCount?.count || 0;

  const products = responseJson.data.products.edges.map((edge: any) => ({
    id: edge.node.id,
    numericId: edge.node.id.replace("gid://shopify/Product/", ""),
    title: edge.node.title,
    handle: edge.node.handle,
    vendor: edge.node.vendor,
    productType: edge.node.productType,
    tags: edge.node.tags || [],
    description: edge.node.descriptionHtml || "",
    image: edge.node.featuredMedia?.preview?.image?.url || "",
    price: edge.node.variants.edges[0]?.node?.price || "0.00",
    barcode: edge.node.variants.edges[0]?.node?.barcode || "",
    sku: edge.node.variants.edges[0]?.node?.sku || "",
    images: edge.node.media.edges
      .filter((m: any) => m.node.preview?.image?.url)
      .map((m: any) => ({
        url: m.node.preview.image.url,
        alt: m.node.preview.image.altText,
      })),
  }));

  // Filtro lato client per descrizioni HTML vuote (es. <p></p>, solo whitespace)
  const finalProducts = onlyMissing
    ? products.filter((p: any) => {
        const cleaned = (p.descriptionHtml || p.description || "").replace(/<[^>]+>/g, "").trim();
        return cleaned.length === 0;
      })
    : products;

  const pageInfo = responseJson.data.products.pageInfo;

  return json({
    products: finalProducts,
    pageInfo,
    totalProducts,
  });
};

// ── ACTION ───────────────────────────────────────────────────
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "generate") {
    const productsJSON = formData.get("products") as string;
    const tone = formData.get("tone") as string;
    const framework = formData.get("framework") as string;
    const language = formData.get("language") as string;
    const keywords = formData.get("keywords") as string;
    const length = formData.get("length") as string;
    const structure = formData.get("structure") as string;
    const useImage = formData.get("useImage") as string;
    const useBarcode = formData.get("useBarcode") as string;
    const products = JSON.parse(productsJSON);

    const BATCH_SIZE = 5;
    const results: any[] = [];

    // Funzione che processa un singolo prodotto (usata in parallelo)
    const processProduct = async (product: any) => {
      let barcodeInfo = "";
      if (useBarcode === "true" && product.barcode) {
        try {
          const searchResp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY || "",
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 300,
              messages: [{
                role: "user",
                content: `Cerca informazioni sul prodotto con codice EAN/barcode: ${product.barcode}. Il prodotto si chiama "${product.title}" del brand "${product.vendor}". Dammi una breve scheda tecnica con caratteristiche principali, materiali, dimensioni se disponibili. Rispondi SOLO con le info trovate, senza prefissi.`
              }],
            }),
          });
          const searchData = await searchResp.json();
          barcodeInfo = searchData.content?.[0]?.text?.trim() || "";
        } catch (e) {
          barcodeInfo = "";
        }
      }

      let imageContext = "";
      if (useImage === "true" && product.image) {
        imageContext = `\n- Immagine prodotto disponibile: ${product.image}`;
      }

      const prompt = buildPrompt(product, tone, framework, language, keywords, length, structure, barcodeInfo, imageContext);

      try {
        const messages: any[] = [];

        if (useImage === "true" && product.image) {
          try {
            const imgResp = await fetch(product.image);
            const imgBuffer = await imgResp.arrayBuffer();
            const base64 = Buffer.from(imgBuffer).toString("base64");
            const contentType = imgResp.headers.get("content-type") || "image/jpeg";

            messages.push({
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: contentType.split(";")[0],
                    data: base64,
                  },
                },
                { type: "text", text: prompt },
              ],
            });
          } catch (imgErr) {
            messages.push({ role: "user", content: prompt });
          }
        } else {
          messages.push({ role: "user", content: prompt });
        }

        const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY || "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: length === "long" ? 1200 : length === "medium" ? 700 : 400,
            messages,
          }),
        });

        const aiData = await aiResponse.json();
        let newDescription = aiData.content?.[0]?.text?.trim() || "";

        newDescription = newDescription
          .replace(/^```html\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        return {
          id: product.id,
          title: product.title,
          image: product.image,
          vendor: product.vendor,
          price: product.price,
          newDescription,
          status: newDescription ? "success" : "error",
        };
      } catch (error: any) {
        return {
          id: product.id,
          title: product.title,
          image: product.image,
          vendor: product.vendor,
          price: product.price,
          newDescription: "",
          status: "error",
          error: error.message,
        };
      }
    };

    // Processa in batch paralleli di 5 prodotti alla volta
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(processProduct));
      results.push(...batchResults);
    }

    return json({ intent: "generate", results });
  }

  if (intent === "push") {
    const productId = formData.get("productId") as string;
    const description = formData.get("description") as string;
    const mode = formData.get("mode") as string || "replace";

    let finalDescription = description;

    if (mode === "append") {
      const getResp = await admin.graphql(
        `#graphql
        query getProduct($id: ID!) {
          product(id: $id) { descriptionHtml }
        }`,
        { variables: { id: productId } }
      );
      const getData = await getResp.json();
      const existing = getData.data?.product?.descriptionHtml || "";
      if (existing.trim()) {
        finalDescription = existing.trimEnd() +
          '\n<hr style="border:none;border-top:1px solid #e8e8e4;margin:24px 0;">\n' +
          description;
      }
    }

    const response = await admin.graphql(
      `#graphql
      mutation updateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id descriptionHtml }
          userErrors { field message }
        }
      }`,
      { variables: { input: { id: productId, descriptionHtml: finalDescription } } }
    );

    const responseJson = await response.json();
    const errors = responseJson.data?.productUpdate?.userErrors || [];

    if (errors.length > 0) {
      return json({ intent: "push", success: false, error: errors[0].message });
    }

    return json({ intent: "push", success: true, productId });
  }

  if (intent === "pushAll") {
    const resultsJSON = formData.get("results") as string;
    const mode = formData.get("mode") as string || "replace";
    const results = JSON.parse(resultsJSON);
    let pushed = 0;
    let errors = 0;

    for (const result of results) {
      if (result.status !== "success") continue;

      let finalDescription = result.newDescription;

      if (mode === "append") {
        const getResp = await admin.graphql(
          `#graphql
          query getProduct($id: ID!) {
            product(id: $id) { descriptionHtml }
          }`,
          { variables: { id: result.id } }
        );
        const getData = await getResp.json();
        const existing = getData.data?.product?.descriptionHtml || "";
        if (existing.trim()) {
          finalDescription = existing.trimEnd() +
            '\n<hr style="border:none;border-top:1px solid #e8e8e4;margin:24px 0;">\n' +
            result.newDescription;
        }
      }

      try {
        const response = await admin.graphql(
          `#graphql
          mutation updateProduct($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }`,
          { variables: { input: { id: result.id, descriptionHtml: finalDescription } } }
        );
        const rJson = await response.json();
        if ((rJson.data?.productUpdate?.userErrors || []).length === 0) {
          pushed++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    return json({ intent: "pushAll", pushed, errors });
  }

  return json({ error: "Intent non valido" });
};

// ── PROMPT BUILDER ───────────────────────────────────────────
function buildPrompt(product: any, tone: string, framework: string, language: string, keywords: string, length: string, structure: string, barcodeInfo: string, imageContext: string) {
  const toneMap: Record<string, string> = {
    professional: "Professionale e autorevole",
    emotional: "Emozionale e coinvolgente",
    technical: "Tecnico e dettagliato",
    luxury: "Luxury, esclusivo e raffinato",
    casual: "Casual e amichevole",
    ironic: "Ironico e originale, smart, con personalità",
    minimal: "Minimal e pulito, ogni parola conta",
  };

  const frameworkMap: Record<string, string> = {
    aida: "AIDA: Attenzione → Interesse → Desiderio → Azione",
    pas: "PAS: Problema → Agitazione → Soluzione",
    fab: "FAB: Feature → Advantage → Benefit",
    storytelling: "Storytelling: racconta una mini-storia o scenario d'uso",
    direct: "Diretto: vai dritto ai benefici",
    comparison: "Confronto: posiziona il prodotto rispetto ad alternative",
  };

  const langMap: Record<string, string> = {
    it: "italiano", en: "inglese", fr: "francese", de: "tedesco", es: "spagnolo",
  };

  const lengthMap: Record<string, string> = {
    short: "BREVE: 50-80 parole, 2-3 frasi",
    medium: "MEDIA: 100-150 parole, con bullet point",
    long: "LUNGA: 200-350 parole, descrizione completa con paragrafi, H3, bullet, CTA",
  };

  const structureMap: Record<string, string> = {
    simple: "Solo paragrafi <p>",
    structured: "<h3> + <p> + <ul><li>",
    rich: "<h3> + <h4> + <p> + <ul><li> + CTA finale in <strong>",
    seo_optimized: "<h3> con keyword + <p> intro + <h4> sottosezioni + <ul><li> con keyword secondarie + CTA, snippet-ready",
  };

  const hasDesc = product.description && product.description.length > 20;
  const cleanDesc = hasDesc ? product.description.replace(/<[^>]+>/g, "").substring(0, 600) : "";

  return `Sei un SEO specialist e copywriter e-commerce di livello senior, specializzato in product page SEO 2026. Conosci a fondo le best practice di SEMrush, Ahrefs, Shopify e Google Search Quality Guidelines.

📦 PRODOTTO DA OTTIMIZZARE:
- Titolo: ${product.title}
- Brand: ${product.vendor || "non specificato"}
- Categoria: ${product.productType || "non specificata"}
- Prezzo: €${product.price}
- EAN/Barcode: ${product.barcode || "N/A"}${imageContext}
${cleanDesc ? `- Descrizione esistente (da migliorare radicalmente, NON copiare): ${cleanDesc}` : ""}
${barcodeInfo ? `\n🔍 INFO TECNICHE DAL BARCODE:\n${barcodeInfo}` : ""}

⚙️ CONFIGURAZIONE:
- Framework copywriting: ${frameworkMap[framework] || framework}
- Tono di voce: ${toneMap[tone] || tone}
- Lingua: ${langMap[language] || language}
- Lunghezza: ${lengthMap[length] || length}
- Struttura HTML: ${structureMap[structure] || structure}
${keywords ? `- Keyword primarie da includere: ${keywords}` : ""}

🎯 BEST PRACTICE SEO 2026 (OBBLIGATORIE):

1. **Keyword strategy**: usa 1 keyword primaria + 3-5 long-tail keyword correlate. Densità keyword 3-5 menzioni ogni 300 parole. Le long-tail devono essere VARIANTI naturali che un acquirente cercherebbe (es. "scarpe running uomo asfalto" invece di solo "scarpe").

2. **Search intent commerciale**: scrivi pensando a chi sta valutando l'acquisto. Includi termini come "comprare", "scegli", "ideale per", "perfetto per" senza forzare.

3. **Features → Benefits**: NON elencare specifiche tecniche secche. Trasforma ogni feature in un beneficio concreto.
   ❌ "Batteria 5000mAh"
   ✅ "Fino a 48 ore di musica senza ricaricare — perfetto per i viaggi"

4. **Problem-solving language**: identifica il problema che il prodotto risolve nelle prime 2 frasi. I clienti comprano soluzioni, non oggetti.

5. **Specifica e concretezza**: niente parole vuote come "alta qualità", "premium", "il migliore", "innovativo". Sostituisci con NUMERI, MATERIALI, USE CASE specifici.

6. **Scannability**: il 79% degli utenti scannerizza, non legge. Usa H3/H4 informativi, bullet point brevi, paragrafi max 3 righe.

7. **AI Overviews ready**: Google AI Overview cita contenuti strutturati. Includi una mini-FAQ in fondo (2-3 domande) per intercettare query dirette.

8. **E-E-A-T signals**: dimostra Expertise/Experience nel testo (es. "test su 1000 ore di utilizzo", "approvato da [autorità]" SE VERO, altrimenti ometti).

9. **Long-tail nei sottotitoli H4**: i sottotitoli devono includere variazioni della keyword per aumentare la rilevanza semantica.

10. **Call-to-action soft**: chiudi con un CTA che richiama urgenza o esclusività SENZA essere pushy.

🚫 ERRORI DA EVITARE:
- NON iniziare con "Questo prodotto" o "Il/La [nome del prodotto]"
- NON usare manufacturer descriptions / generic copy
- NON usare keyword stuffing
- NON ripetere informazioni del titolo
- NON usare titoli generici come "Caratteristiche", "Descrizione", "Dettagli"
- NON inventare certificazioni, premi, statistiche

📝 OUTPUT:
- SOLO HTML valido (no markdown, no backtick, no spiegazioni)
- Struttura semantica corretta (h3, h4, p, ul/li, strong)
- Pronto per essere incollato in Shopify

Genera ora la descrizione HTML ottimizzata:`;
}

// ── COMPONENTE ───────────────────────────────────────────────
export default function Index() {
  const { products, pageInfo, totalProducts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tone, setTone] = useState("emotional");
  const [framework, setFramework] = useState("aida");
  const [language, setLanguage] = useState("it");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState("medium");
  const [structure, setStructure] = useState("structured");
  const [useImage, setUseImage] = useState(true);
  const [useBarcode, setUseBarcode] = useState(true);
  const [pushMode, setPushMode] = useState("replace");
  const [onlyMissing, setOnlyMissing] = useState(searchParams.get("missing") === "true");
  const [bulkProducts, setBulkProducts] = useState<any[]>([]);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const [bulkLoadInfo, setBulkLoadInfo] = useState<string>("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  const handleLoadAllMissing = async () => {
    setIsLoadingBulk(true);
    setBulkLoadInfo("Caricamento prodotti senza descrizione in corso... (può richiedere 10-30 secondi)");
    try {
      const resp = await fetch("/api/load-all-missing");
      const data = await resp.json();
      setBulkProducts(data.products);
      setBulkLoadInfo(`✅ Caricati ${data.products.length} prodotti senza descrizione (${data.pagesLoaded} pagine analizzate)${data.truncated ? " — limite max 500 raggiunto" : ""}`);
    } catch (e: any) {
      setBulkLoadInfo("❌ Errore: " + e.message);
    } finally {
      setIsLoadingBulk(false);
    }
  };
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const filteredProducts = bulkProducts.length > 0 ? bulkProducts : products;
  const resourceIDResolver = (product: any) => product.id;
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredProducts, { resourceIDResolver });

  const isGenerating = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "generate";
  const isPushing = fetcher.state !== "idle" && (fetcher.formData?.get("intent") === "push" || fetcher.formData?.get("intent") === "pushAll");

  if (fetcher.data?.intent === "generate" && fetcher.data?.results) {
    if (JSON.stringify(generatedResults) !== JSON.stringify(fetcher.data.results)) {
      setTimeout(() => setGeneratedResults(fetcher.data.results), 0);
    }
  }

  // Polling dello stato del job ogni 2 secondi
  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/jobs/${activeJobId}`);
        const data = await resp.json();
        setJobStatus(data);
        if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") {
          clearInterval(interval);
          if (data.results && data.results.length > 0) {
            setGeneratedResults(data.results);
          }
          setActiveJobId(null);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleGenerate = useCallback(async () => {
    const selected = filteredProducts.filter((p: any) => selectedResources.includes(p.id));
    if (selected.length === 0) return;

    const settings = { tone, framework, language, keywords, length, structure, useImage, useBarcode };

    try {
      // 1. Crea il job
      const createFd = new FormData();
      createFd.append("type", "descriptions");
      createFd.append("products", JSON.stringify(selected));
      createFd.append("settings", JSON.stringify(settings));

      const createResp = await fetch("/api/jobs/create", { method: "POST", body: createFd });
      const createData = await createResp.json();

      if (!createData.jobId) {
        alert("Errore nella creazione del job: " + (createData.error || "unknown"));
        return;
      }

      setActiveJobId(createData.jobId);
      setJobStatus({ status: "pending", processedItems: 0, totalItems: selected.length, successCount: 0, errorCount: 0 });

      // 2. Avvia il processing in background (fire & forget, si auto-richiama)
      const processLoop = async (jobId: string) => {
        let done = false;
        while (!done) {
          const processFd = new FormData();
          processFd.append("jobId", jobId);
          try {
            const resp = await fetch("/api/jobs/process", { method: "POST", body: processFd });
            const data = await resp.json();
            done = data.done;
            if (!done) {
              // Piccola pausa prima del prossimo chunk (per dare respiro al server)
              await new Promise((r) => setTimeout(r, 500));
            }
          } catch (e) {
            console.error("Process error:", e);
            done = true;
          }
        }
      };
      processLoop(createData.jobId);
    } catch (e: any) {
      alert("Errore: " + e.message);
    }
  }, [selectedResources, filteredProducts, tone, framework, language, keywords, length, structure, useImage, useBarcode]);

  const handlePush = useCallback((productId: string, description: string) => {
    const formData = new FormData();
    formData.append("intent", "push");
    formData.append("productId", productId);
    formData.append("description", description);
    formData.append("mode", pushMode);
    fetcher.submit(formData, { method: "POST" });
  }, [fetcher, pushMode]);

  const handlePushAll = useCallback(() => {
    const successResults = generatedResults.filter((r: any) => r.status === "success");
    if (successResults.length === 0) return;
    const formData = new FormData();
    formData.append("intent", "pushAll");
    formData.append("results", JSON.stringify(successResults));
    formData.append("mode", pushMode);
    fetcher.submit(formData, { method: "POST" });
  }, [generatedResults, fetcher, pushMode]);

  const goToNextPage = () => {
    if (pageInfo.endCursor) {
      const params = new URLSearchParams(searchParams);
      params.set("cursor", pageInfo.endCursor);
      params.set("direction", "next");
      navigate(`/app?${params.toString()}`);
    }
  };

  const goToPrevPage = () => {
    if (pageInfo.startCursor) {
      const params = new URLSearchParams(searchParams);
      params.set("cursor", pageInfo.startCursor);
      params.set("direction", "prev");
      navigate(`/app?${params.toString()}`);
    }
  };

  const goToFirstPage = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("cursor");
    params.delete("direction");
    navigate(`/app?${params.toString()}`);
  };

  const toneOptions = [
    { label: "🎭 Emozionale", value: "emotional" },
    { label: "💼 Professionale", value: "professional" },
    { label: "🔧 Tecnico", value: "technical" },
    { label: "✨ Luxury", value: "luxury" },
    { label: "😎 Casual", value: "casual" },
    { label: "😏 Ironico", value: "ironic" },
    { label: "🎯 Minimal", value: "minimal" },
  ];

  const frameworkOptions = [
    { label: "AIDA — Attenzione → Azione", value: "aida" },
    { label: "PAS — Problema → Soluzione", value: "pas" },
    { label: "FAB — Feature → Benefit", value: "fab" },
    { label: "📖 Storytelling", value: "storytelling" },
    { label: "🎯 Diretto", value: "direct" },
    { label: "⚖️ Confronto", value: "comparison" },
  ];

  const languageOptions = [
    { label: "🇮🇹 Italiano", value: "it" },
    { label: "🇬🇧 English", value: "en" },
    { label: "🇫🇷 Français", value: "fr" },
    { label: "🇩🇪 Deutsch", value: "de" },
    { label: "🇪🇸 Español", value: "es" },
  ];

  const lengthOptions = [
    { label: "📝 Breve (50-80 parole)", value: "short" },
    { label: "📄 Media (100-150 parole)", value: "medium" },
    { label: "📋 Lunga (200-350 parole)", value: "long" },
  ];

  const structureOptions = [
    { label: "Semplice (solo paragrafi)", value: "simple" },
    { label: "Strutturata (H3 + bullet)", value: "structured" },
    { label: "Ricca (H3 + H4 + bullet + CTA)", value: "rich" },
    { label: "🔍 SEO-ottimizzata", value: "seo_optimized" },
  ];

  const pushModeOptions = [
    { label: "🔄 Sostituisci descrizione", value: "replace" },
    { label: "➕ Aggiungi sotto l'esistente", value: "append" },
  ];

  const tabs = [
    { id: "settings", content: "⚙️ Impostazioni", panelID: "settings-panel" },
    { id: "products", content: `📦 Prodotti (${products.length}/${totalProducts})`, panelID: "products-panel" },
    { id: "results", content: `✍️ Risultati${generatedResults.length > 0 ? ` (${generatedResults.length})` : ""}`, panelID: "results-panel" },
  ];

  const successCount = generatedResults.filter((r: any) => r.status === "success").length;

  const rowMarkup = filteredProducts.map((product: any, index: number) => {
    const result = generatedResults.find((r: any) => r.id === product.id);
    return (
      <IndexTable.Row id={product.id} key={product.id} selected={selectedResources.includes(product.id)} position={index}>
        <IndexTable.Cell>
          <Thumbnail
            source={product.image || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"}
            alt={product.title}
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <BlockStack gap="100">
            <Text variant="bodyMd" fontWeight="bold" as="span">{product.title}</Text>
            {product.barcode && (
              <Text variant="bodySm" as="span" tone="subdued">EAN: {product.barcode}</Text>
            )}
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>{product.vendor}</IndexTable.Cell>
        <IndexTable.Cell>€{product.price}</IndexTable.Cell>
        <IndexTable.Cell>{(() => {
          const cleaned = (product.descriptionHtml || product.description || "").replace(/<[^>]+>/g, "").trim();
          return cleaned.length > 0 ? <Badge tone="success">Presente</Badge> : <Badge tone="critical">Mancante</Badge>;
        })()}</IndexTable.Cell>
        <IndexTable.Cell>
          {result ? (
            result.status === "success" ? <Badge tone="success">Generata</Badge> : <Badge tone="critical">Errore</Badge>
          ) : (
            <Badge>In attesa</Badge>
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {result?.status === "success" && (
            <Button size="slim" onClick={() => handlePush(product.id, result.newDescription)} loading={isPushing}>
              Pubblica
            </Button>
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page>
      <TitleBar title="AI Product Description Generator" />
      <BlockStack gap="500">

        <InlineStack gap="400" wrap={true}>
          <Card>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" tone="subdued">Totale catalogo</Text>
              <Text as="p" variant="headingLg">{totalProducts}</Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" tone="subdued">Caricati</Text>
              <Text as="p" variant="headingLg">{products.length}</Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" tone="subdued">Selezionati</Text>
              <Text as="p" variant="headingLg">{selectedResources.length}</Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" tone="subdued">Generati</Text>
              <Text as="p" variant="headingLg">{successCount}</Text>
            </BlockStack>
          </Card>
        </InlineStack>

        <Card>
          <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
            {activeTab === 0 && (
              <Box padding="400">
                <BlockStack gap="500">
                  {activeJobId && jobStatus && (
                    <Banner tone={jobStatus.status === "failed" ? "critical" : jobStatus.status === "completed" ? "success" : "info"}>
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd" fontWeight="bold">
                          {jobStatus.status === "pending" && "⏳ Job in attesa..."}
                          {jobStatus.status === "running" && `🚀 Generazione in corso: ${jobStatus.processedItems}/${jobStatus.totalItems}`}
                          {jobStatus.status === "completed" && `✅ Completato! ${jobStatus.successCount} successi, ${jobStatus.errorCount} errori`}
                          {jobStatus.status === "failed" && `❌ Errore: ${jobStatus.errorMessage || "Sconosciuto"}`}
                        </Text>
                        {(jobStatus.status === "running" || jobStatus.status === "pending") && (
                          <div style={{ width: "100%", height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${jobStatus.totalItems > 0 ? (jobStatus.processedItems / jobStatus.totalItems) * 100 : 0}%`,
                                height: "100%",
                                backgroundColor: "#2CAAD8",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                        )}
                        <Text as="p" variant="bodySm" tone="subdued">
                          Puoi chiudere questa pagina, il job continuerà a girare sul server. Torna più tardi per vedere i risultati.
                        </Text>
                      </BlockStack>
                    </Banner>
                  )}
                  <InlineStack gap="400" wrap={true}>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Tono di voce" options={toneOptions} value={tone} onChange={setTone} />
                    </div>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Framework copy" options={frameworkOptions} value={framework} onChange={setFramework} />
                    </div>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Lingua" options={languageOptions} value={language} onChange={setLanguage} />
                    </div>
                  </InlineStack>

                  <InlineStack gap="400" wrap={true}>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Lunghezza descrizione" options={lengthOptions} value={length} onChange={setLength} />
                    </div>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Struttura HTML" options={structureOptions} value={structure} onChange={setStructure} />
                    </div>
                    <div style={{ minWidth: "200px", flex: 1 }}>
                      <Select label="Modalità pubblicazione" options={pushModeOptions} value={pushMode} onChange={setPushMode} />
                    </div>
                  </InlineStack>

                  <TextField
                    label="Keyword SEO (opzionale)"
                    value={keywords}
                    onChange={setKeywords}
                    placeholder="es: scarpe running, sneakers uomo, regalo sportivo"
                    autoComplete="off"
                    helpText="Separa le keyword con virgola"
                  />

                  <Divider />
                  <Text as="h3" variant="headingMd">🔬 Fonti dati per la generazione</Text>
                  <InlineStack gap="600">
                    <Checkbox
                      label="📸 Analizza immagine prodotto (Claude Vision)"
                      checked={useImage}
                      onChange={setUseImage}
                    />
                    <Checkbox
                      label="🔍 Cerca info da EAN/Barcode"
                      checked={useBarcode}
                      onChange={setUseBarcode}
                    />
                  </InlineStack>

                  <Divider />
                  <InlineStack gap="300" align="end">
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleGenerate}
                      loading={isGenerating}
                      disabled={selectedResources.length === 0}
                    >
                      {isGenerating ? `Generando ${selectedResources.length} descrizioni...` : `🚀 Genera ${selectedResources.length} descrizioni`}
                    </Button>
                  </InlineStack>

                  {selectedResources.length === 0 && (
                    <Banner tone="info">
                      <p>Vai al tab "📦 Prodotti" e seleziona almeno un prodotto.</p>
                    </Banner>
                  )}
                </BlockStack>
              </Box>
            )}

            {activeTab === 1 && (
              <Box padding="400">
                <BlockStack gap="300">
                  <InlineStack gap="400" blockAlign="center" wrap={true}>
                    <Button
                      variant="primary"
                      tone="success"
                      onClick={handleLoadAllMissing}
                      loading={isLoadingBulk}
                    >
                      🔍 Carica TUTTI i prodotti senza descrizione (max 500)
                    </Button>
                    {bulkProducts.length > 0 && (
                      <Button
                        onClick={() => {
                          setBulkProducts([]);
                          setBulkLoadInfo("");
                        }}
                      >
                        ✖ Reset (torna alla paginazione normale)
                      </Button>
                    )}
                  </InlineStack>
                  {bulkLoadInfo && (
                    <Banner tone={bulkLoadInfo.startsWith("❌") ? "critical" : bulkLoadInfo.startsWith("✅") ? "success" : "info"}>
                      <p>{bulkLoadInfo}</p>
                    </Banner>
                  )}
                  {/* FILTRO STATUS */}
                  <InlineStack gap="200" blockAlign="center" wrap>
                    <Text as="p" variant="bodyMd" tone="subdued">Stato prodotto:</Text>
                    {["ACTIVE", "DRAFT", "ARCHIVED", "ALL"].map((s) => (
                      <Button
                        key={s}
                        pressed={(searchParams.get("status") || "ACTIVE") === s}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set("status", s);
                          params.delete("cursor");
                          navigate(`/app?${params.toString()}`);
                        }}
                      >
                        {s === "ACTIVE" ? "✅ Attivi" : s === "DRAFT" ? "📝 Bozze" : s === "ARCHIVED" ? "📦 Archiviati" : "🌐 Tutti"}
                      </Button>
                    ))}
                  </InlineStack>

                  {/* PAGINAZIONE INFO */}
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Mostrando {products.length} di {totalProducts} prodotti
                    </Text>
                    <InlineStack gap="200">
                      <Button onClick={goToFirstPage} disabled={!searchParams.get("cursor")}>
                        ⏮ Inizio
                      </Button>
                      <Button onClick={goToPrevPage} disabled={!pageInfo.hasPreviousPage}>
                        ← Precedente
                      </Button>
                      <Button onClick={goToNextPage} disabled={!pageInfo.hasNextPage}>
                        Successiva →
                      </Button>
                      <Button onClick={() => navigate(0)}>
                        🔄 Aggiorna
                      </Button>
                    </InlineStack>
                  </InlineStack>

                  {products.length > 0 ? (
                    <IndexTable
                      resourceName={{ singular: "prodotto", plural: "prodotti" }}
                      itemCount={filteredProducts.length}
                      selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                      onSelectionChange={handleSelectionChange}
                      headings={[
                        { title: "" },
                        { title: "Prodotto" },
                        { title: "Brand" },
                        { title: "Prezzo" },
                        { title: "Descrizione" },
                        { title: "Stato" },
                        { title: "Azioni" },
                      ]}
                    >
                      {rowMarkup}
                    </IndexTable>
                  ) : (
                    <EmptyState
                      heading="Nessun prodotto trovato"
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>Aggiungi prodotti al tuo negozio per iniziare.</p>
                    </EmptyState>
                  )}

                  {/* PAGINAZIONE BOTTOM */}
                  <InlineStack align="center" gap="200">
                    <Button onClick={goToFirstPage} disabled={!searchParams.get("cursor")}>
                      ⏮ Inizio
                    </Button>
                    <Button onClick={goToPrevPage} disabled={!pageInfo.hasPreviousPage}>
                      ← Precedente
                    </Button>
                    <Button onClick={goToNextPage} disabled={!pageInfo.hasNextPage}>
                      Successiva →
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Box>
            )}

            {activeTab === 2 && (
              <Box padding="400">
                <BlockStack gap="400">
                  {generatedResults.length === 0 ? (
                    <Banner tone="info">
                      <p>Nessuna descrizione generata ancora. Seleziona i prodotti e clicca "Genera".</p>
                    </Banner>
                  ) : (
                    <>
                      <InlineStack gap="300" align="space-between">
                        <Text as="h2" variant="headingLg">{successCount} descrizioni pronte</Text>
                        <Button variant="primary" onClick={handlePushAll} loading={isPushing} disabled={successCount === 0}>
                          ✅ Pubblica tutte ({successCount}) su Shopify
                        </Button>
                      </InlineStack>

                      {fetcher.data?.intent === "pushAll" && (
                        <Banner tone="success">
                          <p>Pubblicati {fetcher.data.pushed} prodotti! {fetcher.data.errors > 0 ? `(${fetcher.data.errors} errori)` : ""}</p>
                        </Banner>
                      )}

                      {generatedResults.map((result: any) => (
                        <Card key={result.id}>
                          <BlockStack gap="300">
                            <InlineStack align="space-between" blockAlign="center">
                              <InlineStack gap="300" blockAlign="center">
                                {result.image && <Thumbnail source={result.image} alt={result.title} size="small" />}
                                <BlockStack gap="100">
                                  <Text as="h3" variant="headingMd">{result.title}</Text>
                                  <Text as="p" variant="bodySm" tone="subdued">{result.vendor} · €{result.price}</Text>
                                </BlockStack>
                              </InlineStack>
                              {result.status === "success" ? <Badge tone="success">OK</Badge> : <Badge tone="critical">Errore</Badge>}
                            </InlineStack>

                            {result.status === "success" && (
                              <>
                                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                                  <div dangerouslySetInnerHTML={{ __html: result.newDescription }} style={{ lineHeight: "1.6", fontSize: "14px" }} />
                                </Box>
                                <InlineStack gap="200">
                                  <Button variant="primary" onClick={() => handlePush(result.id, result.newDescription)} loading={isPushing}>
                                    ✅ Pubblica su Shopify
                                  </Button>
                                  <Button onClick={() => navigator.clipboard.writeText(result.newDescription)}>
                                    📋 Copia HTML
                                  </Button>
                                </InlineStack>
                              </>
                            )}

                            {result.status === "error" && (
                              <Banner tone="critical">
                                <p>{result.error || "Errore nella generazione"}</p>
                              </Banner>
                            )}
                          </BlockStack>
                        </Card>
                      ))}
                    </>
                  )}
                </BlockStack>
              </Box>
            )}
          </Tabs>
        </Card>
      </BlockStack>
    </Page>
  );
}
