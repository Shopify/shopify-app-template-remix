import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { processPipeline, PipelineOperation } from "../lib/image-suite.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Processa una pipeline di immagini su un set di prodotti
  if (intent === "process") {
    const productsJSON = formData.get("products") as string;
    const operationsJSON = formData.get("operations") as string;

    if (!productsJSON || !operationsJSON) {
      return json({ error: "Missing fields" }, { status: 400 });
    }

    const products = JSON.parse(productsJSON);
    const operations: PipelineOperation[] = JSON.parse(operationsJSON);

    const results: any[] = [];

    for (const product of products) {
      const productResults: any[] = [];

      for (const img of product.images) {
        try {
          const { finalUrl, steps } = await processPipeline(img.url, operations);
          productResults.push({
            originalUrl: img.url,
            finalUrl,
            steps,
            mediaId: img.mediaId,
            originalWidth: img.width,
            originalHeight: img.height,
            status: "success",
          });
        } catch (err: any) {
          productResults.push({
            originalUrl: img.url,
            mediaId: img.mediaId,
            status: "error",
            error: err.message,
          });
        }
      }

      results.push({
        productId: product.id,
        title: product.title,
        images: productResults,
      });
    }

    return json({ intent: "process", results });
  }

  // Sostituisci immagine su Shopify
  if (intent === "replace") {
    const productId = formData.get("productId") as string;
    const oldMediaId = formData.get("oldMediaId") as string;
    const newImageUrl = formData.get("newImageUrl") as string;

    try {
      const createResp = await admin.graphql(
        `#graphql
        mutation createMedia($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media { ... on MediaImage { id image { url } } }
            mediaUserErrors { field message }
          }
        }`,
        {
          variables: {
            productId,
            media: [{ originalSource: newImageUrl, mediaContentType: "IMAGE", alt: "Processed image" }],
          },
        }
      );
      const createJson = await createResp.json();
      const errors = createJson.data?.productCreateMedia?.mediaUserErrors || [];
      if (errors.length > 0) return json({ success: false, error: errors[0].message });

      const deleteResp = await admin.graphql(
        `#graphql
        mutation deleteMedia($productId: ID!, $mediaIds: [ID!]!) {
          productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
            deletedMediaIds
            mediaUserErrors { field message }
          }
        }`,
        { variables: { productId, mediaIds: [oldMediaId] } }
      );
      const deleteJson = await deleteResp.json();
      const deleteErrors = deleteJson.data?.productDeleteMedia?.mediaUserErrors || [];
      if (deleteErrors.length > 0) {
        return json({ success: true, warning: deleteErrors[0].message });
      }

      return json({ success: true });
    } catch (err: any) {
      return json({ success: false, error: err.message });
    }
  }

  return json({ error: "Intent non valido" });
};
