import { useState, useEffect, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Tabs,
  Button,
  ButtonGroup,
  Banner,
  Thumbnail,
  Badge,
  Text,
  TextField,
  Select,
  ChoiceList,
  IndexTable,
  useIndexResourceState,
  Pagination,
  InlineStack,
  BlockStack,
  Box,
  ProgressBar,
  Modal,
  Toast,
  Frame,
  EmptyState,
  Tag,
  Spinner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import type { Taxonomy } from "../lib/taxonomy.server";
import { loadTaxonomy } from "../lib/taxonomy.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const taxonomy = await loadTaxonomy(session.shop);
  return json({ taxonomy, shop: session.shop });
}

export default function TagsManagerPage() {
  const { taxonomy: initialTaxonomy } = useLoaderData<typeof loader>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);

  const tabs = [
    { id: "products", content: "Prodotti", accessibilityLabel: "Gestione tag prodotti" },
    { id: "taxonomy", content: "Tassonomia", accessibilityLabel: "Editor tassonomia" },
    { id: "jobs", content: "Jobs & Queue", accessibilityLabel: "Coda job" },
  ];

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
  };

  return (
    <Frame>
      <Page
        title="Tags Manager"
        subtitle="Gestione CRUD dei tag prodotto con AI"
        fullWidth
      >
        <Layout>
          <Layout.Section>
            <Card padding="0">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
              >
                <Box padding="400">
                  {selectedTab === 0 && (
                    <ProductsTab
                      taxonomy={initialTaxonomy}
                      onToast={showToast}
                    />
                  )}
                  {selectedTab === 1 && (
                    <TaxonomyTab
                      initial={initialTaxonomy}
                      onToast={showToast}
                    />
                  )}
                  {selectedTab === 2 && <JobsTab onToast={showToast} />}
                </Box>
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>
        {toastMessage && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastMessage(null)}
          />
        )}
      </Page>
    </Frame>
  );
}

// ============================================================
// TAB 1: PRODOTTI
// ============================================================
type Product = {
  id: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  tagsGrouped: Record<string, string[]>;
  status: string;
  image: string | null;
  pendingTags: string[] | null;
  draftStatus: string | null;
};

function ProductsTab({ taxonomy, onToast }: { taxonomy: Taxonomy; onToast: (m: string, e?: boolean) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<string[]>([]);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; endCursor?: string }>({
    hasNextPage: false,
  });
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Filtri
  const [status, setStatus] = useState("any");
  const [vendorFilter, setVendorFilter] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [search, setSearch] = useState("");

  // Selezione persistente multi-page
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Carica vendor al mount
  useEffect(() => {
    fetch("/api/tags/vendors")
      .then(r => r.json())
      .then(d => setVendors(d.vendors || []))
      .catch(() => {});
  }, []);

  const loadPage = useCallback(async (cursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (vendorFilter) params.set("vendor", vendorFilter);
      if (onlyMissing) params.set("missing", "true");
      if (search) params.set("search", search);
      params.set("limit", "50");
      if (cursor) params.set("cursor", cursor);

      const resp = await fetch(`/api/tags/products?${params.toString()}`);
      const data = await resp.json();
      if (data.error) {
        onToast(data.error, true);
      } else {
        setProducts(data.products);
        setPageInfo(data.pageInfo);
      }
    } catch (e: any) {
      onToast("Errore caricamento: " + e.message, true);
    } finally {
      setLoading(false);
    }
  }, [status, vendorFilter, onlyMissing, search, onToast]);

  // Ricarica quando cambiano i filtri
  useEffect(() => {
    setCursorStack([]);
    loadPage();
  }, [status, vendorFilter, onlyMissing]);

  const handleNextPage = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      setCursorStack(prev => [...prev, pageInfo.endCursor!]);
      loadPage(pageInfo.endCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorStack.length > 0) {
      const newStack = [...cursorStack];
      newStack.pop();
      setCursorStack(newStack);
      loadPage(newStack[newStack.length - 1]);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const selectAllOnPage = () => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      products.forEach(p => next.add(p.id));
      return next;
    });
  };

  const clearSelection = () => setSelectedProductIds(new Set());

  // Azioni bulk
  const runBulkAction = async (
    kind: "generate" | "cleanup_sku" | "bulk_remove",
    options?: Record<string, any>
  ) => {
    if (selectedProductIds.size === 0) {
      onToast("Nessun prodotto selezionato", true);
      return;
    }
    try {
      const resp = await fetch("/api/tags/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          productIds: Array.from(selectedProductIds),
          options,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        onToast(data.error, true);
      } else {
        onToast(`Job #${data.jobId} creato (${data.totalItems} prodotti)`);
        // Avvia subito il worker
        fetch("/api/tags/jobs/process", { method: "POST" }).catch(() => {});
      }
    } catch (e: any) {
      onToast("Errore: " + e.message, true);
    }
  };

  const commitPendingTags = async () => {
    // Filtro prodotti con pending
    const withPending = products.filter(p => p.pendingTags !== null);
    const ids = withPending.map(p => p.id).filter(id => selectedProductIds.has(id));
    if (ids.length === 0) {
      onToast("Nessun prodotto selezionato con tag pending", true);
      return;
    }
    try {
      const resp = await fetch("/api/tags/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "push", productIds: ids }),
      });
      const data = await resp.json();
      if (data.error) onToast(data.error, true);
      else {
        onToast(`Job push #${data.jobId} creato (${data.totalItems} prodotti)`);
        fetch("/api/tags/jobs/process", { method: "POST" }).catch(() => {});
      }
    } catch (e: any) {
      onToast("Errore: " + e.message, true);
    }
  };

  return (
    <BlockStack gap="400">
      {/* Filtri */}
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">Filtri</Text>
          <InlineStack gap="300" wrap>
            <Box minWidth="200px">
              <Select
                label="Status"
                options={[
                  { label: "Tutti", value: "any" },
                  { label: "Active", value: "active" },
                  { label: "Draft", value: "draft" },
                  { label: "Archived", value: "archived" },
                ]}
                value={status}
                onChange={setStatus}
              />
            </Box>
            <Box minWidth="200px">
              <Select
                label="Brand"
                options={[
                  { label: "Tutti i brand", value: "" },
                  ...vendors.map(v => ({ label: v, value: v })),
                ]}
                value={vendorFilter}
                onChange={setVendorFilter}
              />
            </Box>
            <Box minWidth="200px">
              <TextField
                label="Cerca nel titolo"
                value={search}
                onChange={setSearch}
                autoComplete="off"
                connectedRight={
                  <Button onClick={() => loadPage()}>Cerca</Button>
                }
              />
            </Box>
            <Box paddingBlockStart="600">
              <ChoiceList
                title=""
                titleHidden
                choices={[{ label: "Solo senza tag strutturati", value: "missing" }]}
                selected={onlyMissing ? ["missing"] : []}
                onChange={sel => setOnlyMissing(sel.includes("missing"))}
              />
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Azioni bulk */}
      <Card>
        <BlockStack gap="300">
          <InlineStack gap="300" align="space-between">
            <Text as="h2" variant="headingMd">
              Azioni ({selectedProductIds.size} selezionati)
            </Text>
            {selectedProductIds.size > 0 && (
              <Button onClick={clearSelection} variant="plain">
                Deseleziona tutti
              </Button>
            )}
          </InlineStack>
          <ButtonGroup>
            <Button variant="primary" onClick={() => runBulkAction("generate")}>
              Genera tag con AI
            </Button>
            <Button onClick={commitPendingTags}>
              Pusha pending su Shopify
            </Button>
            <Button onClick={() => runBulkAction("cleanup_sku")}>
              Pulisci tag SKU:
            </Button>
            <Button tone="critical" onClick={() => {
              if (confirm("Sicuro di rimuovere TUTTI i tag dai prodotti selezionati?")) {
                // Costruisci una lista di tutti i tag presenti
                const allTags = new Set<string>();
                products
                  .filter(p => selectedProductIds.has(p.id))
                  .forEach(p => p.tags.forEach(t => allTags.add(t)));
                runBulkAction("bulk_remove", { tagsToRemove: Array.from(allTags) });
              }
            }}>
              Reset tutti i tag
            </Button>
          </ButtonGroup>
        </BlockStack>
      </Card>

      {/* Tabella prodotti */}
      <Card padding="0">
        {loading ? (
          <Box padding="800" >
            <InlineStack align="center"><Spinner accessibilityLabel="Loading" /></InlineStack>
          </Box>
        ) : products.length === 0 ? (
          <EmptyState
            heading="Nessun prodotto"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Modifica i filtri o prova una ricerca diversa.</p>
          </EmptyState>
        ) : (
          <>
            <Box padding="300" background="bg-surface-secondary">
              <InlineStack align="space-between">
                <Button onClick={selectAllOnPage} variant="plain">
                  Seleziona tutti in questa pagina
                </Button>
                <Text as="span" variant="bodySm" tone="subdued">
                  Pagina {cursorStack.length + 1} • {products.length} prodotti
                </Text>
              </InlineStack>
            </Box>
            <ProductsTable
              products={products}
              selectedIds={selectedProductIds}
              onToggleSelection={toggleProductSelection}
            />
            <Box padding="300">
              <InlineStack align="center">
                <Pagination
                  hasPrevious={cursorStack.length > 0}
                  onPrevious={handlePrevPage}
                  hasNext={pageInfo.hasNextPage}
                  onNext={handleNextPage}
                />
              </InlineStack>
            </Box>
          </>
        )}
      </Card>
    </BlockStack>
  );
}

function ProductsTable({
  products,
  selectedIds,
  onToggleSelection,
}: {
  products: Product[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
}) {
  const resourceName = { singular: "prodotto", plural: "prodotti" };

  const rows = products.map((p, index) => (
    <IndexTable.Row
      id={p.id}
      key={p.id}
      position={index}
      selected={selectedIds.has(p.id)}
      onClick={() => onToggleSelection(p.id)}
    >
      <IndexTable.Cell>
        <Thumbnail
          source={p.image || "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/no-image.png"}
          alt={p.title}
          size="small"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span" fontWeight="semibold" variant="bodyMd">
            {p.title.substring(0, 60)}
            {p.title.length > 60 ? "..." : ""}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {p.vendor || "—"} · {p.productType || "—"}
          </Text>
        </BlockStack>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "DRAFT" ? "info" : "critical"}>
          {p.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TagGroupsDisplay grouped={p.tagsGrouped} />
      </IndexTable.Cell>
      <IndexTable.Cell>
        {p.pendingTags ? (
          <Badge tone="attention">
            {`${p.pendingTags.length} tag pending`}
          </Badge>
        ) : (
          <Text as="span" variant="bodySm" tone="subdued">—</Text>
        )}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <IndexTable
      resourceName={resourceName}
      itemCount={products.length}
      selectable={false} // selezione custom (persistente multi-page)
      headings={[
        { title: "Img" },
        { title: "Prodotto" },
        { title: "Status" },
        { title: "Tag attuali" },
        { title: "Pending" },
      ]}
    >
      {rows}
    </IndexTable>
  );
}

function TagGroupsDisplay({ grouped }: { grouped: Record<string, string[]> }) {
  if (Object.keys(grouped).length === 0) {
    return <Text as="span" variant="bodySm" tone="subdued">—</Text>;
  }
  const toneMap: Record<string, "info" | "success" | "warning" | "critical" | "attention"> = {
    per: "info",
    occ: "attention",
    stile: "success",
    micro: "warning",
    tema: "attention",
    SKU: "critical",
  };
  return (
    <InlineStack gap="100" wrap>
      {Object.entries(grouped).map(([prefix, values]) => (
        <InlineStack key={prefix} gap="050">
          {values.slice(0, 3).map(v => (
            <Badge key={v} tone={toneMap[prefix] || "info"}>
              {`${prefix}:${v}`}
            </Badge>
          ))}
          {values.length > 3 && (
            <Text as="span" variant="bodySm" tone="subdued">
              {`+${values.length - 3}`}
            </Text>
          )}
        </InlineStack>
      ))}
    </InlineStack>
  );
}

// ============================================================
// TAB 2: TASSONOMIA
// ============================================================
function TaxonomyTab({ initial, onToast }: { initial: Taxonomy; onToast: (m: string, e?: boolean) => void }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(initial, null, 2));
  const [saving, setSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<number | null>(null);

  let parsed: Taxonomy | null = null;
  let parseError: string | null = null;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e: any) {
    parseError = e.message;
  }

  const save = async () => {
    if (parseError || !parsed) {
      onToast("JSON non valido: " + parseError, true);
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch("/api/tags/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxonomy: parsed }),
      });
      const data = await resp.json();
      if (data.error) onToast(data.error, true);
      else onToast("Tassonomia salvata - versione " + (parsed.version + 1));
    } catch (e: any) {
      onToast("Errore: " + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BlockStack gap="400">
      <Banner>
        <p>
          La tassonomia definisce quali tag può assegnare l'AI. Modifica il JSON qui sotto e premi Salva.
          Le descrizioni aiutano l'AI a scegliere i tag giusti.
        </p>
      </Banner>

      {parsed && (
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Anteprima: {parsed.groups.length} gruppi, {parsed.groups.reduce((acc, g) => acc + g.values.length, 0)} tag
            </Text>
            <BlockStack gap="200">
              {parsed.groups.map((g, i) => (
                <Box key={i} padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <InlineStack gap="200">
                      <Text as="span" fontWeight="bold">{g.label}</Text>
                      <Badge tone="info">{`${g.prefix}: (${g.values.length})`}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">{g.description}</Text>
                    <InlineStack gap="100" wrap>
                      {g.values.map((v, j) => (
                        <Tag key={j}>{`${g.prefix}:${v.value}`}</Tag>
                      ))}
                    </InlineStack>
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      )}

      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">Editor JSON</Text>
          {parseError && (
            <Banner tone="critical"><p>JSON non valido: {parseError}</p></Banner>
          )}
          <TextField
            label=""
            labelHidden
            value={jsonText}
            onChange={setJsonText}
            multiline={30}
            autoComplete="off"
            monospaced
          />
          <InlineStack>
            <Button variant="primary" onClick={save} loading={saving} disabled={!!parseError}>
              Salva tassonomia
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ============================================================
// TAB 3: JOBS
// ============================================================
type Job = {
  id: number;
  kind: string;
  status: string;
  totalItems: number;
  processedItems: number;
  successItems: number;
  failedItems: number;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorLog?: any[];
};

function JobsTab({ onToast }: { onToast: (m: string, e?: boolean) => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/tags/jobs");
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      setJobs(data.jobs || []);
    } catch (e: any) {
      onToast("Errore caricamento jobs: " + e.message, true);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  const triggerProcess = async () => {
    try {
      const resp = await fetch("/api/tags/jobs/process", { method: "POST" });
      const data = await resp.json();
      onToast(`Processati ${data.processedJobs} job`);
      loadJobs();
    } catch (e: any) {
      onToast("Errore: " + e.message, true);
    }
  };

  const kindLabel: Record<string, string> = {
    generate: "Genera tag AI",
    push: "Push su Shopify",
    bulk_remove: "Rimozione bulk",
    cleanup_sku: "Pulizia SKU:",
  };

  const statusTone = (s: string): "info" | "success" | "warning" | "critical" | "attention" => {
    if (s === "completed") return "success";
    if (s === "running") return "attention";
    if (s === "failed") return "critical";
    if (s === "queued") return "info";
    return "info";
  };

  return (
    <BlockStack gap="400">
      <Card>
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd">Job attivi e recenti</Text>
          <ButtonGroup>
            <Button onClick={loadJobs} loading={loading}>Ricarica</Button>
            <Button variant="primary" onClick={triggerProcess}>
              Elabora subito job in coda
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Card>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState heading="Nessun job" image="">
            <p>I job di generazione, push e pulizia appariranno qui.</p>
          </EmptyState>
        </Card>
      ) : (
        jobs.map(job => (
          <Card key={job.id}>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <InlineStack gap="300">
                  <Text as="span" fontWeight="semibold">#{job.id}</Text>
                  <Badge>{kindLabel[job.kind] || job.kind}</Badge>
                  <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                </InlineStack>
                <Text as="span" variant="bodySm" tone="subdued">
                  {new Date(job.createdAt).toLocaleString("it-IT")}
                </Text>
              </InlineStack>
              <ProgressBar progress={job.progress} />
              <InlineStack gap="400">
                <Text as="span" variant="bodySm">
                  Processati: {job.processedItems}/{job.totalItems}
                </Text>
                <Text as="span" variant="bodySm" tone="success">
                  OK: {job.successItems}
                </Text>
                {job.failedItems > 0 && (
                  <Text as="span" variant="bodySm" tone="critical">
                    Errori: {job.failedItems}
                  </Text>
                )}
              </InlineStack>
              {job.errorLog && job.errorLog.length > 0 && (
                <Button onClick={() => setSelectedJob(job)} variant="plain">
                  Vedi errori ({job.errorLog.length})
                </Button>
              )}
            </BlockStack>
          </Card>
        ))
      )}

      {selectedJob && (
        <Modal
          open={true}
          onClose={() => setSelectedJob(null)}
          title={`Errori job #${selectedJob.id}`}
        >
          <Modal.Section>
            <BlockStack gap="200">
              {selectedJob.errorLog?.map((e: any, i: number) => (
                <Box key={i} padding="300" background="bg-surface-critical-subdued" borderRadius="200">
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    {e.productId}
                  </Text>
                  <Text as="p" variant="bodySm">{e.error}</Text>
                </Box>
              ))}
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </BlockStack>
  );
}
