import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Page, Card, BlockStack, InlineStack, Button, Text, Badge, Thumbnail, Banner, TextField, Checkbox, RadioButton } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getGroups, getLatestScan } from "../lib/consolidation.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const [groups, scan] = await Promise.all([getGroups(session.shop), getLatestScan(session.shop)]);
  return json({ groups, scan });
}

export default function Consolidation() {
  const { groups, scan } = useLoaderData<typeof loader>();
  const scanFetcher = useFetcher<{ scanId: number }>();
  const procFetcher = useFetcher<any>();
  const cancelFetcher = useFetcher<{ ok?: boolean }>();
  const checkFetcher = useFetcher<any>();
  const revalidator = useRevalidator();
  const [vendor, setVendor] = useState("");
  const running = scan?.status === "queued" || scan?.status === "running";

  useEffect(() => {
    if (scanFetcher.data?.scanId) {
      procFetcher.submit({ scanId: scanFetcher.data.scanId }, { method: "post", action: "/api/consolidation/process", encType: "application/json" });
    }
  }, [scanFetcher.data]);

  useEffect(() => {
    const r = procFetcher.data?.results?.[0];
    if (r && r.done === false) {
      procFetcher.submit({ scanId: r.scanId }, { method: "post", action: "/api/consolidation/process", encType: "application/json" });
    } else if (r && (r.done === true || r.error)) {
      revalidator.revalidate();
    }
  }, [procFetcher.data]);

  useEffect(() => {
    if (cancelFetcher.data?.ok) revalidator.revalidate();
  }, [cancelFetcher.data]);

  const startScan = () => scanFetcher.submit({ vendor }, { method: "post", action: "/api/consolidation/scan" });
  const resumeScan = () => scan && procFetcher.submit({ scanId: scan.id }, { method: "post", action: "/api/consolidation/process", encType: "application/json" });
  const stopScan = () => scan && cancelFetcher.submit({ scanId: scan.id }, { method: "post", action: "/api/consolidation/cancel", encType: "application/json" });

  return (
    <Page title="Consolidamento Varianti" subtitle="Trova prodotti separati che sono in realtà varianti dello stesso prodotto">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <TextField label="Filtra per vendor (opzionale, es. Havaianas)" helpText="La scansione considera solo i prodotti ATTIVI." value={vendor} onChange={setVendor} autoComplete="off" />
            <InlineStack gap="300" align="start" blockAlign="center">
              <Button variant="primary" disabled={running} loading={scanFetcher.state !== "idle"} onClick={startScan}>
                Avvia scansione
              </Button>
              {running && (
                <>
                  <Button onClick={resumeScan} loading={procFetcher.state !== "idle"}>Riprendi</Button>
                  <Button tone="critical" onClick={stopScan} loading={cancelFetcher.state !== "idle"}>Ferma scansione</Button>
                </>
              )}
              {scan && (
                <Text as="span" tone="subdued">
                  Ultima scansione: {scan.status} · {scan.totalScanned} prodotti
                </Text>
              )}
            </InlineStack>
            <InlineStack gap="300" align="start" blockAlign="center">
              <Button onClick={() => checkFetcher.load("/api/consolidation/check-inventory")} loading={checkFetcher.state !== "idle"}>
                Verifica accesso inventario
              </Button>
              {checkFetcher.data && (
                checkFetcher.data.ok
                  ? <Text as="span" tone="success">Inventario OK · Location: {checkFetcher.data.location?.name || checkFetcher.data.location?.id}</Text>
                  : <Text as="span" tone="critical">Non accessibile: {checkFetcher.data.error}</Text>
              )}
            </InlineStack>
          </BlockStack>
        </Card>

        {scan?.status === "failed" && (
          <Banner tone="critical" title="La scansione è fallita">
            <Text as="p" variant="bodySm">{scan.errorLog || "Errore sconosciuto (nessun dettaglio salvato)."}</Text>
          </Banner>
        )}
        {groups.length === 0 && !running && (
          <Banner tone="info">Nessun gruppo trovato. Avvia una scansione per popolare i candidati.</Banner>
        )}

        {groups.map((g) => (
          <MergeGroup key={g.bucketKey} group={g} onChanged={() => revalidator.revalidate()} />
        ))}
      </BlockStack>
    </Page>
  );
}

function MergeGroup({ group, onChanged }: { group: any; onChanged: () => void }) {
  const planFetcher = useFetcher<any>();
  const execFetcher = useFetcher<any>();
  const ignoreFetcher = useFetcher<{ ok?: boolean }>();
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(group.members.map((m: any) => [m.productId, true])),
  );
  const [masterId, setMasterId] = useState<string>(group.members[0]?.productId || "");
  const [photoUrl, setPhotoUrl] = useState<string>(group.members[0]?.imageUrl || "");
  const [masterTitle, setMasterTitle] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, { size: string; color: string }>>(
    () => Object.fromEntries(group.members.map((m: any) => [m.productId, { size: m.detectedSize || "", color: m.detectedColor || "" }])),
  );
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (ignoreFetcher.data?.ok) onChanged();
  }, [ignoreFetcher.data]);

  useEffect(() => {
    if (execFetcher.data?.result?.ok) onChanged();
  }, [execFetcher.data]);

  const selectedIds = group.members.filter((m: any) => selected[m.productId]).map((m: any) => m.productId);
  const effectiveMaster = selected[masterId] ? masterId : selectedIds[0];
  const plan = planFetcher.data?.plan;
  const execResult = execFetcher.data?.result;

  const payload = () => ({
    productIds: selectedIds,
    masterProductId: effectiveMaster,
    featuredImageUrl: photoUrl,
    masterTitle,
    overrides,
  });

  const preview = () => planFetcher.submit({ intent: "plan", ...payload() }, { method: "post", action: "/api/consolidation/merge", encType: "application/json" });
  const runMerge = () => {
    execFetcher.submit({ intent: "execute", ...payload() }, { method: "post", action: "/api/consolidation/merge", encType: "application/json" });
    setConfirming(false);
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">{group.vendor} — {group.titleNormalized || "(senza titolo)"}</Text>
          <InlineStack gap="200" blockAlign="center">
            <Badge tone="info">{`${group.count} prodotti`}</Badge>
            {group.hashConsistent ? <Badge tone="success">Foto coerenti</Badge> : <Badge tone="warning">Foto divergenti</Badge>}
            <Button variant="plain" tone="critical" loading={ignoreFetcher.state !== "idle"} onClick={() => ignoreFetcher.submit({ bucketKey: group.bucketKey }, { method: "post", action: "/api/consolidation/ignore" })}>
              Ignora
            </Button>
          </InlineStack>
        </InlineStack>

        <Text as="p" tone="subdued" variant="bodySm">
          Spunta i prodotti che sono lo stesso articolo, scegli master e foto principale, correggi taglia/colore se serve, poi genera l'anteprima.
        </Text>

        <BlockStack gap="300">
          {group.members.map((m: any) => {
            const isSel = !!selected[m.productId];
            const ov = overrides[m.productId] || { size: "", color: "" };
            const setOv = (field: "size" | "color", value: string) => setOverrides((o) => ({ ...o, [m.productId]: { ...o[m.productId], [field]: value } }));
            return (
              <InlineStack key={m.id} gap="300" blockAlign="start">
                <Checkbox label="Includi nel merge" labelHidden checked={isSel} onChange={(v) => setSelected((s) => ({ ...s, [m.productId]: v }))} />
                <Thumbnail source={m.imageUrl || ""} alt={m.productTitle} size="small" />
                <BlockStack gap="100">
                  <Text as="span" variant="bodyMd">{m.productTitle}</Text>
                  <Text as="span" tone="subdued" variant="bodySm">SKU {m.sku || "—"}{m.barcode ? ` · EAN ${m.barcode}` : ""}</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <RadioButton label="Master" checked={masterId === m.productId} disabled={!isSel} name={`master-${group.bucketKey}`} onChange={() => setMasterId(m.productId)} />
                    <RadioButton label="Foto principale" checked={photoUrl === m.imageUrl} disabled={!m.imageUrl} name={`photo-${group.bucketKey}`} onChange={() => setPhotoUrl(m.imageUrl)} />
                  </InlineStack>
                  <InlineStack gap="200">
                    <TextField label="Taglia" labelHidden placeholder="Taglia" value={ov.size} onChange={(v) => setOv("size", v)} autoComplete="off" />
                    <TextField label="Colore" labelHidden placeholder="Colore" value={ov.color} onChange={(v) => setOv("color", v)} autoComplete="off" />
                  </InlineStack>
                </BlockStack>
              </InlineStack>
            );
          })}
        </BlockStack>

        <TextField label="Titolo del prodotto unificato" placeholder="(lascia vuoto per tenere il titolo del master)" helpText="Usalo per togliere taglia/colore dal titolo." value={masterTitle} onChange={setMasterTitle} autoComplete="off" />

        <InlineStack gap="300">
          <Button onClick={preview} disabled={selectedIds.length < 2} loading={planFetcher.state !== "idle"}>
            Anteprima merge ({selectedIds.length})
          </Button>
        </InlineStack>

        {plan && <MergePlanView plan={plan} />}

        {plan && !confirming && !execResult && (
          <InlineStack gap="300">
            <Button variant="primary" tone="critical" onClick={() => setConfirming(true)}>Esegui merge</Button>
          </InlineStack>
        )}
        {confirming && (
          <Banner tone="warning" title="Operazione irreversibile su prodotti live">
            <BlockStack gap="200">
              <Text as="p" variant="bodySm">Verranno create le varianti sul master e archiviati gli altri prodotti. Consigliato: prima su un solo gruppo.</Text>
              <InlineStack gap="300">
                <Button variant="primary" tone="critical" loading={execFetcher.state !== "idle"} onClick={runMerge}>Conferma ed esegui</Button>
                <Button onClick={() => setConfirming(false)}>Annulla</Button>
              </InlineStack>
            </BlockStack>
          </Banner>
        )}
        {execResult && <MergeResultView result={execResult} />}
      </BlockStack>
    </Card>
  );
}

function MergePlanView({ plan }: { plan: any }) {
  return (
    <Card background="bg-surface-secondary">
      <BlockStack gap="200">
        <Text as="h4" variant="headingSm">Anteprima del merge (nessuna modifica applicata)</Text>
        {plan.warnings?.length > 0 && (
          <Banner tone="warning">
            <BlockStack gap="100">
              {plan.warnings.map((w: string, i: number) => (<Text as="p" variant="bodySm" key={i}>{w}</Text>))}
            </BlockStack>
          </Banner>
        )}
        <Text as="p" variant="bodySm">Prodotto master: <b>{plan.masterTitle || "—"}</b></Text>
        <Text as="p" variant="bodySm">Opzioni: {plan.options?.length ? plan.options.map((o: any) => `${o.name} (${o.values.join(", ")})`).join(" · ") : "—"}</Text>
        <BlockStack gap="100">
          {plan.variants?.map((v: any) => (
            <InlineStack key={v.productId} gap="200" blockAlign="center">
              <Thumbnail source={v.imageUrl || ""} alt={v.title} size="extraSmall" />
              <Text as="span" variant="bodySm">
                {v.optionValues.map((o: any) => o.value).join(" / ") || "—"} · SKU {v.sku || "—"}{v.barcode ? ` · EAN ${v.barcode}` : ""}{v.isMaster ? " · master" : ""}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>
        <Text as="p" tone="subdued" variant="bodySm">
          Verranno archiviati {plan.archiveProductIds?.length || 0} prodotti (gli slave). Mapping SKU/EAN salvato nel metafield danea.sku_mapping del master.
        </Text>
      </BlockStack>
    </Card>
  );
}

function MergeResultView({ result }: { result: any }) {
  return (
    <Banner tone={result.ok ? "success" : "critical"} title={result.ok ? "Merge eseguito" : "Merge con problemi"}>
      <BlockStack gap="100">
        <Text as="p" variant="bodySm">Varianti create: {result.createdVariants} · Prodotti archiviati: {result.archived}</Text>
        {(result.errors || []).map((e: string, i: number) => (<Text as="p" tone="critical" variant="bodySm" key={`e${i}`}>⛔ {e}</Text>))}
        {(result.warnings || []).map((w: string, i: number) => (<Text as="p" tone="subdued" variant="bodySm" key={`w${i}`}>⚠️ {w}</Text>))}
      </BlockStack>
    </Banner>
  );
}
