import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GET /api/tags/vendors
 * Restituisce la lista dei vendor unici (per popolare il dropdown filter).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const gqlQuery = `
    query shopVendors {
      shop { productVendors(first: 250) { edges { node } } }
    }
  `;

  const response = await admin.graphql(gqlQuery);
  const body: any = await response.json();

  const vendors =
    body.data?.shop?.productVendors?.edges?.map((e: any) => e.node).filter(Boolean) || [];

  return json({ vendors: vendors.sort() });
}
