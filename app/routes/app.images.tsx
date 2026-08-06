import { useState, useCallback, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Page,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Banner,
  IndexTable,
  Thumbnail,
  EmptyState,
  Select,
  Checkbox,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { loadProductsWithImages } from "../lib/upscale.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const direction = url.searchParams.get("direction") || "next";
  const data = await loadProductsWithImages(admin, cursor, direction);
  return json(data);
};

export default function ImagesPage() {
  const { products, pageInfo, totalProducts } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pipeline operations state
  const [opResize, setOpResize] = useState(true);
  const [resizeSize, setResizeSize] = useState("2048");
  const [resizeBg, setResizeBg] = useState("white");

  const [opCrop, setOpCrop] = useState(false);

  const [opRemoveBg, setOpRemoveBg] = useState(false);
  const [removeBgReplace, setRemoveBgReplace] = useState("white");

  const [opUpscale, setOpUpscale] = useState(true);
  const [upscaleModel, setUpscaleModel] = useState("swinir");
  const [upscaleScale, setUpscaleScale] = useState("2");

  // Selection persistente
  const [persistedSelection, setPersistedSelection] = useState<Set<string>>(new Set());
  const [onlyLowRes, setOnlyLowRes] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(true);

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  let filteredProducts = products;
  if (hideEmpty) {
    filteredProducts = filteredProducts.filter((p: any) => p.imageCount > 0);
  }
  if (onlyLowRes) {
    filteredProducts = filteredProducts.filter((p: any) => p.needsUpscale);
  }

  const selectedResources = filteredProducts
    .filter((p: any) => persistedSelection.has(p.id))
    .map((p: any) => p.id);

  const allResourcesSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: any) => persistedSelection.has(p.id));

  const handleSelectionChange = (selectionType: any, isSelecting: boolean, selection?: any) => {
    setPersistedSelection((prev) => {
      const next = new Set(prev);
      if (selectionType === "all" || selectionType === "page") {
        filteredProducts.forEach((p: any) => {
          if (isSelecting) next.add(p.id);
          else next.delete(p.id);
        });
      } else if (selectionType === "single") {
        if (isSelecting) next.add(selection);
        else next.delete(selection);
      } else if (selectionType === "multi") {
        const [start, end] = selection;
        for (let i = start; i <= end; i++) {
          const p = filteredProducts[i];
          if (p) {
            if (isSelecting) next.add(p.id);
            else next.delete(p.id);
          }
        }
      }
      return next;
    });
  };

  const clearAllSelection = () => setPersistedSelection(new Set());

  // Calcola costo stimato
  const operationsCount = [opRemoveBg, opUpscale].filter(Boolean).length;
  const imagesPerProduct = 1; // approssimazione
  let costPerImage = 0;
  if (opRemoveBg) costPerImage += 0.002;
  if (opUpscale) costPerImage += upscaleModel === "clarity" ? 0.05 : 0.005;
  const estimatedCost = (persistedSelection.size * imagesPerProduct * costPerImage).toFixed(3);

  const buildOperations = () => {
    const ops: any[] = [];
    if (opCrop) ops.push({ type: "crop" });
    if (opRemoveBg) ops.push({ type: "removeBackground", options: { replaceWith: removeBgReplace } });
    if (opUpscale) ops.push({ type: "upscale", options: { model: upscaleModel, scale: parseInt(upscaleScale) } });
    if (opResize) ops.push({ type: "resize", options: { targetSize: parseInt(resizeSize), background: resizeBg } });
    return ops;
  };

  // Polling stato job ogni 2 secondi
  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/jobs/${activeJobId}`);
        const d = await r.json();
        setJobStatus(d);
        if (d.status === "completed" || d.status === "failed" || d.status === "cancelled") {
          clearInterval(interval);
          if (d.results && d.results.length > 0) {
            setResults(d.results);
          }
          setActiveJobId(null);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleExecute = useCallback(async () => {
    const selected = filteredProducts.filter((p: any) => persistedSelection.has(p.id));
    if (selected.length === 0) return;

    const ops = buildOperations();
    if (ops.length === 0) {
      alert("Seleziona almeno una operazione");
      return;
    }

    try {
      // 1. Crea il job
      const createFd = new FormData();
      createFd.append("type", "images");
      createFd.append("products", JSON.stringify(selected));
      createFd.append("settings", JSON.stringify({ operations: ops }));

      const createResp = await fetch("/api/jobs/create", { method: "POST", body: createFd });
      const createData = await createResp.json();

      if (!createData.jobId) {
        alert("Errore creazione job: " + (createData.error || "unknown"));
        return;
      }

      setActiveJobId(createData.jobId);
      setJobStatus({ status: "pending", processedItems: 0, totalItems: selected.length, successCount: 0, errorCount: 0 });

      // 2. Avvia processing in background
      const processLoop = async (jobId: string) => {
        let done = false;
        while (!done) {
          const fd = new FormData();
          fd.append("jobId", jobId);
          try {
            const r = await fetch("/api/jobs/process", { method: "POST", body: fd });
            const d = await r.json();
            done = d.done;
            if (!done) await new Promise((res) => setTimeout(res, 500));
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
  }, [filteredProducts, persistedSelection, opCrop, opRemoveBg, opUpscale, opResize, removeBgReplace, upscaleModel, upscaleScale, resizeSize, resizeBg]);

  const handleReplace = useCallback(async (productId: string, mediaId: string, newUrl: string) => {
    setIsReplacing(mediaId);
    try {
      const fd = new FormData();
      fd.append("intent", "replace");
      fd.append("productId", productId);
      fd.append("oldMediaId", mediaId);
      fd.append("newImageUrl", newUrl);

      const resp = await fetch("/api/image-pipeline", { method: "POST", body: fd });
      const data = await resp.json();

      if (data.success) {
        alert("✅ Immagine sostituita con successo!");
      } else {
        alert("❌ Errore: " + (data.error || "unknown"));
      }
    } catch (e: any) {
      alert("Errore: " + e.message);
    } finally {
      setIsReplacing(null);
    }
  }, []);

  const goToNextPage = () => {
    if (pageInfo.endCursor) navigate(`/app/images?cursor=${encodeURIComponent(pageInfo.endCursor)}&direction=next`);
  };
  const goToPrevPage = () => {
    if (pageInfo.startCursor) navigate(`/app/images?cursor=${encodeURIComponent(pageInfo.startCursor)}&direction=prev`);
  };
  const goToFirstPage = () => navigate("/app/images");

  const sizeOptions = [
    { label: "2048×2048 (Shopify standard)", value: "2048" },
    { label: "1024×1024", value: "1024" },
    { label: "4096×4096", value: "4096" },
  ];
  const bgOptions = [
    { label: "Sfondo bianco", value: "white" },
    { label: "Sfondo trasparente", value: "transparent" },
    { label: "Colore dominante", value: "dominant" },
  ];
  const removeBgOptions = [
    { label: "Sostituisci con bianco", value: "white" },
    { label: "Trasparente (PNG)", value: "transparent" },
  ];
  const modelOptions = [
    { label: "SwinIR (€0.005, fedele)", value: "swinir" },
    { label: "Clarity Pro (€0.05, top)", value: "clarity" },
  ];
  const scaleOptions = [
    { label: "2x", value: "2" },
    { label: "4x", value: "4" },
  ];

  const rowMarkup = filteredProducts.map((product: any, index: number) => (
    <IndexTable.Row id={product.id} key={product.id} selected={selectedResources.includes(product.id)} position={index}>
      <IndexTable.Cell>
        {product.images[0] ? <Thumbnail source={product.images[0].url} alt={product.title} size="small" /> : <Text as="span" tone="subdued">—</Text>}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">{product.title}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{product.vendor}</IndexTable.Cell>
      <IndexTable.Cell>{product.imageCount}</IndexTable.Cell>
      <IndexTable.Cell>{product.minDimension > 0 ? `${product.minDimension}px` : "—"}</IndexTable.Cell>
      <IndexTable.Cell>
        {product.needsUpscale ? <Badge tone="warning">Da upscalare</Badge> : product.minDimension >= 1000 ? <Badge tone="success">OK</Badge> : <Badge>—</Badge>}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page>
      <TitleBar title="🖼️ Image Suite" />
      <BlockStack gap="500">

        {/* STATS */}
        <InlineStack gap="400" wrap>
          <Card><BlockStack gap="100"><Text as="p" variant="bodySm" tone="subdued">Caricati</Text><Text as="p" variant="headingLg">{products.length}/{totalProducts}</Text></BlockStack></Card>
          <Card>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" tone="subdued">Selezionati</Text>
              <Text as="p" variant="headingLg">{persistedSelection.size}</Text>
              {persistedSelection.size > 0 && <Button size="micro" onClick={clearAllSelection}>Pulisci</Button>}
            </BlockStack>
          </Card>
          <Card><BlockStack gap="100"><Text as="p" variant="bodySm" tone="subdued">Operazioni</Text><Text as="p" variant="headingLg">{[opResize, opCrop, opRemoveBg, opUpscale].filter(Boolean).length}</Text></BlockStack></Card>
          <Card><BlockStack gap="100"><Text as="p" variant="bodySm" tone="subdued">Costo stimato</Text><Text as="p" variant="headingLg">€{estimatedCost}</Text></BlockStack></Card>
        </InlineStack>

        {/* PIPELINE BUILDER */}
        {activeJobId && jobStatus && (
          <Banner tone={jobStatus.status === "failed" ? "critical" : jobStatus.status === "completed" ? "success" : "info"}>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="bold">
                {jobStatus.status === "pending" && "⏳ Job in attesa..."}
                {jobStatus.status === "running" && `🚀 Elaborazione: ${jobStatus.processedItems}/${jobStatus.totalItems}`}
                {jobStatus.status === "completed" && `✅ Completato! ${jobStatus.successCount} successi, ${jobStatus.errorCount} errori`}
                {jobStatus.status === "failed" && `❌ Errore: ${jobStatus.errorMessage || "Sconosciuto"}`}
              </Text>
              {(jobStatus.status === "running" || jobStatus.status === "pending") && (
                <div style={{ width: "100%", height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${jobStatus.totalItems > 0 ? (jobStatus.processedItems / jobStatus.totalItems) * 100 : 0}%`, height: "100%", backgroundColor: "#2CAAD8", transition: "width 0.3s ease" }} />
                </div>
              )}
              <Text as="p" variant="bodySm" tone="subdued">
                Puoi chiudere la pagina e tornare più tardi — il job continua sul server.
              </Text>
            </BlockStack>
          </Banner>
        )}

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">⚙️ Pipeline operazioni</Text>
            <Text as="p" variant="bodySm" tone="subdued">Spunta le operazioni da eseguire. Vengono applicate in sequenza ottimale (crop → rimuovi sfondo → upscale → resize).</Text>

            {/* Op 1: Crop */}
            <Box padding="300" background="bg-surface-secondary" borderRadius="200">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox label="" labelHidden checked={opCrop} onChange={setOpCrop} />
                  <Text as="span" variant="bodyMd" fontWeight="bold">📐 Crop intelligente</Text>
                  <Badge tone="success">Gratis</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Rimuove bordi e sfondi vuoti automaticamente</Text>
              </BlockStack>
            </Box>

            {/* Op 2: Rimuovi sfondo */}
            <Box padding="300" background="bg-surface-secondary" borderRadius="200">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox label="" labelHidden checked={opRemoveBg} onChange={setOpRemoveBg} />
                  <Text as="span" variant="bodyMd" fontWeight="bold">🎨 Rimuovi sfondo</Text>
                  <Badge tone="warning">€0.002/foto</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Background removal AI con sostituzione</Text>
                {opRemoveBg && (
                  <div style={{ maxWidth: "260px" }}>
                    <Select label="" labelHidden options={removeBgOptions} value={removeBgReplace} onChange={setRemoveBgReplace} />
                  </div>
                )}
              </BlockStack>
            </Box>

            {/* Op 3: Upscale */}
            <Box padding="300" background="bg-surface-secondary" borderRadius="200">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox label="" labelHidden checked={opUpscale} onChange={setOpUpscale} />
                  <Text as="span" variant="bodyMd" fontWeight="bold">✨ Upscale AI</Text>
                  <Badge tone="warning">€0.005-0.05/foto</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Aumenta risoluzione con AI</Text>
                {opUpscale && (
                  <InlineStack gap="200" wrap>
                    <div style={{ minWidth: "260px" }}>
                      <Select label="" labelHidden options={modelOptions} value={upscaleModel} onChange={setUpscaleModel} />
                    </div>
                    <div style={{ minWidth: "100px" }}>
                      <Select label="" labelHidden options={scaleOptions} value={upscaleScale} onChange={setUpscaleScale} />
                    </div>
                  </InlineStack>
                )}
              </BlockStack>
            </Box>

            {/* Op 4: Resize */}
            <Box padding="300" background="bg-surface-secondary" borderRadius="200">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox label="" labelHidden checked={opResize} onChange={setOpResize} />
                  <Text as="span" variant="bodyMd" fontWeight="bold">🔲 Resize / Quadratura</Text>
                  <Badge tone="success">Gratis</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Porta tutte le immagini a dimensione standard</Text>
                {opResize && (
                  <InlineStack gap="200" wrap>
                    <div style={{ minWidth: "260px" }}>
                      <Select label="" labelHidden options={sizeOptions} value={resizeSize} onChange={setResizeSize} />
                    </div>
                    <div style={{ minWidth: "200px" }}>
                      <Select label="" labelHidden options={bgOptions} value={resizeBg} onChange={setResizeBg} />
                    </div>
                  </InlineStack>
                )}
              </BlockStack>
            </Box>

            <Divider />

            <InlineStack align="end">
              <Button
                variant="primary"
                size="large"
                onClick={handleExecute}
                loading={isProcessing}
                disabled={persistedSelection.size === 0 || activeJobId !== null}
              >
                {activeJobId ? "Job in corso..." : `🚀 Esegui pipeline (${persistedSelection.size} prodotti)`}
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* PRODOTTI */}
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">📦 Prodotti</Text>
            <InlineStack gap="400" wrap>
              <Checkbox
                label="📸 Solo prodotti con almeno 1 immagine"
                checked={hideEmpty}
                onChange={setHideEmpty}
              />
              <Checkbox
                label="🔴 Solo immagini < 1000px (questa pagina)"
                checked={onlyLowRes}
                onChange={setOnlyLowRes}
              />
            </InlineStack>
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" variant="bodyMd" tone="subdued">Mostrando {filteredProducts.length} prodotti</Text>
              <InlineStack gap="200">
                <Button onClick={goToFirstPage} disabled={!searchParams.get("cursor")}>⏮ Inizio</Button>
                <Button onClick={goToPrevPage} disabled={!pageInfo.hasPreviousPage}>← Precedente</Button>
                <Button onClick={goToNextPage} disabled={!pageInfo.hasNextPage}>Successiva →</Button>
                <Button onClick={() => navigate(0)}>🔄 Aggiorna</Button>
              </InlineStack>
            </InlineStack>

            {filteredProducts.length > 0 ? (
              <IndexTable
                resourceName={{ singular: "prodotto", plural: "prodotti" }}
                itemCount={filteredProducts.length}
                selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                headings={[{ title: "" }, { title: "Prodotto" }, { title: "Brand" }, { title: "# Foto" }, { title: "Min dim." }, { title: "Stato" }]}
              >
                {rowMarkup}
              </IndexTable>
            ) : (
              <EmptyState heading="Nessun prodotto" image=""><p>Nessun prodotto trovato.</p></EmptyState>
            )}
          </BlockStack>
        </Card>

        {/* RISULTATI */}
        {results.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">✨ Risultati pipeline</Text>
              {results.map((result: any) => (
                <Card key={result.productId}>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">{result.title}</Text>
                    {result.images.map((img: any, idx: number) => (
                      <Card key={idx}>
                        <BlockStack gap="200">
                          {img.status === "success" ? (
                            <>
                              <InlineStack gap="400">
                                <BlockStack gap="100">
                                  <Text as="p" variant="bodySm" tone="subdued">Originale ({img.originalWidth}x{img.originalHeight})</Text>
                                  <img src={img.originalUrl} alt="originale" style={{ maxWidth: "200px", border: "1px solid #ccc" }} />
                                </BlockStack>
                                <BlockStack gap="100">
                                  <Text as="p" variant="bodySm" tone="subdued">Processata</Text>
                                  <img src={img.finalUrl} alt="processata" style={{ maxWidth: "200px", border: "1px solid #4CAF50" }} />
                                </BlockStack>
                              </InlineStack>
                              {img.steps && (
                                <Text as="p" variant="bodySm" tone="subdued">{img.steps.join(" → ")}</Text>
                              )}
                              <InlineStack gap="200">
                                <Button
                                  variant="primary"
                                  onClick={() => handleReplace(result.productId, img.mediaId, img.finalUrl)}
                                  loading={isReplacing === img.mediaId}
                                >
                                  ✅ Sostituisci su Shopify
                                </Button>
                                <Button onClick={() => window.open(img.finalUrl, "_blank")}>📥 Scarica</Button>
                              </InlineStack>
                            </>
                          ) : (
                            <Banner tone="critical"><p>Errore: {img.error}</p></Banner>
                          )}
                        </BlockStack>
                      </Card>
                    ))}
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          </Card>
        )}

      </BlockStack>
    </Page>
  );
}
