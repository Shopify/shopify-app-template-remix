import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Read-only: verifica se l'app può leggere le location (cioè se ha gli scope
// inventario). Serve a confermare la riautorizzazione prima di un merge vero.
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  try {
    const resp = await admin.graphql(`{ locations(first: 1) { nodes { id name } } }`);
    const body: any = await resp.json();
    if (body.errors) return json({ ok: false, error: JSON.stringify(body.errors) });
    const loc = body.data?.locations?.nodes?.[0];
    if (!loc) return json({ ok: false, error: "Nessuna location restituita." });
    return json({ ok: true, location: loc });
  } catch (e: any) {
    return json({ ok: false, error: e.message || String(e) });
  }
}
