import Replicate from "replicate";

const PRODUCTS_PER_PAGE = 250;

export async function loadProductsWithImages(admin: any, cursor: string | null, direction: string) {
  let query: string;

  if (cursor && direction === "next") {
    query = `#graphql
      query getProductsWithImages($cursor: String!) {
        products(first: ${PRODUCTS_PER_PAGE}, after: $cursor, sortKey: CREATED_AT, reverse: true) {
          edges {
            cursor
            node {
              id title vendor
              media(first: 10) {
                edges {
                  node {
                    id
                    preview { image { url altText width height } }
                  }
                }
              }
            }
          }
          pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        }
      }`;
  } else if (cursor && direction === "prev") {
    query = `#graphql
      query getProductsWithImages($cursor: String!) {
        products(last: ${PRODUCTS_PER_PAGE}, before: $cursor, sortKey: CREATED_AT, reverse: true) {
          edges {
            cursor
            node {
              id title vendor
              media(first: 10) {
                edges {
                  node {
                    id
                    preview { image { url altText width height } }
                  }
                }
              }
            }
          }
          pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        }
      }`;
  } else {
    query = `#graphql
      query getProductsWithImages {
        products(first: ${PRODUCTS_PER_PAGE}, sortKey: CREATED_AT, reverse: true) {
          edges {
            cursor
            node {
              id title vendor
              media(first: 10) {
                edges {
                  node {
                    id
                    preview { image { url altText width height } }
                  }
                }
              }
            }
          }
          pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        }
      }`;
  }

  const variables = cursor ? { cursor } : {};
  const response = await admin.graphql(query, { variables });
  const responseJson = await response.json();


  const totalProducts = responseJson.data.products.edges.length;
  const products = responseJson.data.products.edges.map((edge: any) => {
    const images = edge.node.media.edges
      .filter((m: any) => m.node.preview?.image?.url)
      .map((m: any) => ({
        mediaId: m.node.id,
        url: m.node.preview.image.url,
        alt: m.node.preview.image.altText || "",
        width: m.node.preview.image.width || 0,
        height: m.node.preview.image.height || 0,
      }));

    const minDimension = images.length > 0
      ? Math.min(...images.map((img: any) => Math.min(img.width, img.height)))
      : 0;

    return {
      id: edge.node.id,
      title: edge.node.title,
      vendor: edge.node.vendor,
      images,
      imageCount: images.length,
      minDimension,
      needsUpscale: minDimension > 0 && minDimension < 1000,
    };
  });

  return {
    products,
    pageInfo: responseJson.data.products.pageInfo,
    totalProducts,
  };
}

export async function upscaleImages(products: any[], scale: number, model: string = "swinir") {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const results: any[] = [];

  for (const product of products) {
    const productResults: any[] = [];

    for (const img of product.images) {
      try {
        let imageUrlForUpscale: string = img.url;
        let modelId = "";
        let modelInput: any = {};

        if (model === "clarity") {
          modelId = "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";
          modelInput = {
            image: imageUrlForUpscale,
            scale_factor: scale,
            dynamic: 6,
            creativity: 0.1,
            resemblance: 2.5,
            sharpen: 1,
            num_inference_steps: 25,
            handfix: "disabled",
            output_format: "png",
          };
        } else {
          // Default: SwinIR
          modelId = "jingyunliang/swinir:660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a";
          modelInput = {
            image: imageUrlForUpscale,
            task_type: "Real-World Image Super-Resolution-Large",
            noise: 15,
            jpeg: 40,
          };
        }

        let output;
        let attempts = 0;
        const maxAttempts = 4;
        while (attempts < maxAttempts) {
          try {
            output = await replicate.run(modelId as `${string}/${string}:${string}`, {
              input: modelInput,
            });
            break;
          } catch (err: any) {
            attempts++;
            const errMsg = err.message || String(err);
            if (errMsg.includes("429") || errMsg.includes("Too Many Requests")) {
              const retryMatch = errMsg.match(/retry_after["\s:]+(\d+)/);
              const retrySec = retryMatch ? parseInt(retryMatch[1]) : 12;
              const waitMs = (retrySec + 2) * 1000;
              console.log(`[UPSCALE] Rate limit hit, waiting ${waitMs}ms before retry ${attempts}/${maxAttempts}`);
              await new Promise((res) => setTimeout(res, waitMs));
              continue;
            }
            throw err;
          }
        }
        if (!output) throw new Error("Max retries reached after rate limit");

        const upscaledUrl = typeof output === "string" ? output : String(output);

        productResults.push({
          originalUrl: img.url,
          upscaledUrl,
          mediaId: img.mediaId,
          originalWidth: img.width,
          originalHeight: img.height,
          newWidth: img.width * scale,
          newHeight: img.height * scale,
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

  return results;
}

export async function replaceProductImage(admin: any, productId: string, oldMediaId: string, newImageUrl: string) {
  const createResp = await admin.graphql(
    `#graphql
    mutation createMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          ... on MediaImage {
            id
            image { url }
          }
        }
        mediaUserErrors { field message }
      }
    }`,
    {
      variables: {
        productId,
        media: [{
          originalSource: newImageUrl,
          mediaContentType: "IMAGE",
          alt: "Upscaled product image",
        }],
      },
    }
  );

  const createJson = await createResp.json();
  const errors = createJson.data?.productCreateMedia?.mediaUserErrors || [];
  if (errors.length > 0) {
    return { success: false, error: errors[0].message };
  }

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
    return { success: true, warning: "Nuova immagine creata ma vecchia non eliminata: " + deleteErrors[0].message };
  }

  return { success: true };
}
