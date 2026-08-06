import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { groupTagsByPrefix } from "../lib/taxonomy.server";

/**
 * GET /api/tags/products
 * Query params:
 *   - status: active | draft | archived | any (default: any)
 *   - vendor: string (optional)
 *   - missing: "true" = solo prodotti senza tag strutturati (per:, occ:, stile:)
 *   - cursor: string (Shopify GraphQL cursor per paginazione)
 *   - limit: number (default: 50, max: 100)
 *   - search: string (cerca nel titolo)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "any";
  const vendor = url.searchParams.get("vendor");
  const missing = url.searchParams.get("missing") === "true";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const search = url.searchParams.get("search");

  // Costruzione query string per Shopify search syntax
  const queryParts: string[] = [];
  if (status !== "any") queryParts.push(`status:${status}`);
  if (vendor) queryParts.push(`vendor:"${vendor}"`);
  if (search) queryParts.push(`title:*${search}*`);
  const queryString = queryParts.join(" AND ");

  const gqlQuery = `
    query listProducts($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            vendor
            productType
            tags
            status
            featuredImage { url }
          }
        }
      }
    }
  `;

  const response = await admin.graphql(gqlQuery, {
    variables: {
      first: limit,
      after: cursor || null,
      query: queryString || null,
    },
  });

  const body: any = await response.json();
  if (body.errors) {
    return json({ error: "GraphQL error", details: body.errors }, { status: 500 });
  }

  const edges = body.data?.products?.edges || [];
  const pageInfo = body.data?.products?.pageInfo || { hasNextPage: false };

  // Carica gli ID dei prodotti per joinare con eventuali ProductTagDraft
  const productIds = edges.map((e: any) => e.node.id);
  const drafts = await prisma.productTagDraft.findMany({
    where: { shop, productId: { in: productIds }, status: "pending" },
  });
  const draftsByProductId = new Map(drafts.map(d => [d.productId, d]));

  let products = edges.map((e: any) => {
    const draft = draftsByProductId.get(e.node.id);
    return {
      id: e.node.id,
      title: e.node.title,
      vendor: e.node.vendor,
      productType: e.node.productType,
      tags: e.node.tags || [],
      tagsGrouped: groupTagsByPrefix(e.node.tags || []),
      status: e.node.status,
      image: e.node.featuredImage?.url || null,
      pendingTags: draft ? JSON.parse(draft.proposedTags) : null,
      draftStatus: draft?.status || null,
    };
  });

  // Filtro "missing" applicato lato server dopo il fetch
  if (missing) {
    products = products.filter((p: any) => {
      const hasStructured = p.tags.some(
        (t: string) =>
          t.startsWith("per:") ||
          t.startsWith("occ:") ||
          t.startsWith("stile:") ||
          t.startsWith("micro:") ||
          t.startsWith("tema:")
      );
      return !hasStructured;
    });
  }

  return json({
    products,
    pageInfo,
  });
}
