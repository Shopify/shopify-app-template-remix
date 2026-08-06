import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const MAX_PRODUCTS = 500;
const PER_PAGE = 100;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "ACTIVE";

  const statusQueryMap: Record<string, string> = {
    ACTIVE: "status:active",
    DRAFT: "status:draft",
    ARCHIVED: "status:archived",
    ALL: "",
  };
  const statusQuery = statusQueryMap[statusFilter] || "status:active";
  const fullQuery = [statusQuery, "-description:*"].filter(Boolean).join(" ");

  let allProducts: any[] = [];
  let cursor: string | null = null;
  let hasNext = true;
  let pagesLoaded = 0;
  const maxPages = Math.ceil(MAX_PRODUCTS / PER_PAGE);

  while (hasNext && pagesLoaded < maxPages) {
    const query = cursor
      ? `#graphql
        query loadProducts($cursor: String!) {
          products(first: ${PER_PAGE}, after: $cursor, query: "${fullQuery}") {
            edges {
              cursor
              node {
                id title handle vendor productType descriptionHtml status
                featuredMedia { preview { image { url } } }
                variants(first: 1) { edges { node { price barcode sku } } }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }`
      : `#graphql
        query loadProducts {
          products(first: ${PER_PAGE}, query: "${fullQuery}") {
            edges {
              cursor
              node {
                id title handle vendor productType descriptionHtml status
                featuredMedia { preview { image { url } } }
                variants(first: 1) { edges { node { price barcode sku } } }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }`;

    const variables = cursor ? { cursor } : {};
    const response = await admin.graphql(query, { variables });
    const responseJson = await response.json();
    const edges = responseJson.data?.products?.edges || [];

    // Filtro lato server per HTML pulito davvero VUOTO (non solo "corto")
    const filteredEdges = edges.filter((e: any) => {
      const desc = e.node.descriptionHtml || "";
      const cleanDesc = desc.replace(/<[^>]+>/g, "").trim();
      return cleanDesc.length === 0;
    });

    const products = filteredEdges.map((edge: any) => ({
      id: edge.node.id,
      numericId: edge.node.id.replace("gid://shopify/Product/", ""),
      title: edge.node.title,
      handle: edge.node.handle,
      vendor: edge.node.vendor,
      productType: edge.node.productType,
      description: edge.node.descriptionHtml || "",
      descriptionHtml: edge.node.descriptionHtml || "",
      image: edge.node.featuredMedia?.preview?.image?.url || "",
      price: edge.node.variants.edges[0]?.node?.price || "0.00",
      barcode: edge.node.variants.edges[0]?.node?.barcode || "",
      sku: edge.node.variants.edges[0]?.node?.sku || "",
      images: [],
    }));

    allProducts = allProducts.concat(products);
    hasNext = responseJson.data?.products?.pageInfo?.hasNextPage || false;
    cursor = responseJson.data?.products?.pageInfo?.endCursor || null;
    pagesLoaded++;
    if (allProducts.length >= MAX_PRODUCTS) break;
  }

  return json({
    products: allProducts.slice(0, MAX_PRODUCTS),
    totalLoaded: allProducts.length,
    pagesLoaded,
    truncated: allProducts.length >= MAX_PRODUCTS && hasNext,
  });
};
