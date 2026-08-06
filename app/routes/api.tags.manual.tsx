import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { stripSkuTags } from "../lib/taxonomy.server";

/**
 * POST /api/tags/manual
 * Body: { productId: string, action: "add" | "remove" | "replace", tags: string[] }
 * Modifica immediata (non passa dai draft) - usare con cautela.
 */
export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);

  const body = await request.json();
  const { productId, action: op, tags } = body as {
    productId: string;
    action: "add" | "remove" | "replace";
    tags: string[];
  };

  if (!productId || !op || !Array.isArray(tags)) {
    return json({ error: "productId, action, tags required" }, { status: 400 });
  }

  // Fetch current tags
  const numericId = productId.replace(/\D/g, "");
  const gid = `gid://shopify/Product/${numericId}`;

  const getResponse = await admin.graphql(
    `query getProduct($id: ID!) {
      product(id: $id) { id tags }
    }`,
    { variables: { id: gid } }
  );

  const getData: any = await getResponse.json();
  if (!getData.data?.product) {
    return json({ error: "Product not found" }, { status: 404 });
  }

  const currentTags: string[] = getData.data.product.tags || [];
  let newTags: string[];

  switch (op) {
    case "add":
      newTags = Array.from(new Set([...currentTags, ...tags]));
      break;
    case "remove":
      newTags = currentTags.filter(t => !tags.includes(t));
      break;
    case "replace":
      newTags = tags;
      break;
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }

  // Rimuovi sempre tag SKU:
  newTags = stripSkuTags(newTags);

  // Update
  const updateResponse = await admin.graphql(
    `mutation updateProductTags($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id tags }
        userErrors { field message }
      }
    }`,
    { variables: { input: { id: gid, tags: newTags } } }
  );

  const updateData: any = await updateResponse.json();
  const userErrors = updateData.data?.productUpdate?.userErrors || [];
  if (userErrors.length > 0) {
    return json({ error: "Shopify userErrors", userErrors }, { status: 500 });
  }

  return json({
    success: true,
    productId,
    newTags,
    removed: currentTags.filter(t => !newTags.includes(t)),
    added: newTags.filter(t => !currentTags.includes(t)),
  });
}
