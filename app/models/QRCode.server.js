import qrcode from "qrcode";
import db from "../db.server";
import { APP_URL } from "../shopify.server";

export async function createMetaFieldDefinition(graphql) {
  return graphql(
    `
      mutation metafieldDefinitionCreate(
        $definition: MetafieldDefinitionInput!
      ) {
        metafieldDefinitionCreate(definition: $definition) {
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        definition: {
          name: "Product qr codes",
          ownerType: "PRODUCT",
          namespace: "$app:qrcodes",
          key: "qrcode",
          type: "json",
        },
      },
    }
  );
}

export function createQRCode(data, grapqhl) {
  return grapqhl(
    `
      mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        metafields: {
          owner: data.productId,
          ownerType: "PRODUCT",
          namespace: "$app:qrcodes",
          value: JSON.stringify({ data }),
        },
      },
    }
  );
}

export function validateQRCode(data) {
  const errors = {};

  if (!data.title) {
    errors.title = "Title is required";
  }

  if (!data.productId) {
    errors.productId = "Product is required";
  }

  if (!data.destination) {
    errors.destination = "Destination is required";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

export async function getQRCode(id, graphql) {
  const QRCode = await db.qRCode.findFirst({ where: { id } });

  if (!QRCode) {
    return null;
  }

  return hydrateQRCode(QRCode, graphql);
}

export async function getQRCodes(shop, graphql) {
  const response = await graphql(
    `
      {
        metafieldDefinitions(
          namespace: "$app:qrcodes"
          key: "qrcode"
          ownerType: PRODUCT
          first: 25
        ) {
          nodes {
            metafields(first: 25) {
              nodes {
                createdAt
                key
                value
                owner {
                  ... on Product {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    `
  );

  const json = await response.json();

  console.log(JSON.stringify(json, null, 2));

  const QRCodes = await db.qRCode.findMany({
    where: { shop },
    orderBy: { id: "desc" },
  });

  if (!QRCodes.length) {
    return [];
  }

  return Promise.all(
    QRCodes.map(async (QRCode) => hydrateQRCode(QRCode, graphql))
  );
}

export async function incrementScanCount(id) {
  await db.qRCode.update({
    where: { id },
    data: { scans: { increment: 1 } },
  });
}

async function hydrateQRCode(QRCode, graphql) {
  // TODO: Use GraphQL to get the product data we need
  const response = await graphql(
    `
      query hydrateQrCode($id: ID!) {
        product(id: $id) {
          title
          handle
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
    {
      variables: {
        id: QRCode.productId,
      },
    }
  );

  const {
    data: { product },
  } = await response.json();

  const destinationUrl =
    QRCode.destination === "product"
      ? productViewURL(QRCode.shop, product.handle)
      : productCheckoutURL(QRCode.shop, QRCode.productVariantId);

  return {
    ...QRCode,
    destinationUrl,
    productDeleted: !product.title,
    productTitle: product.title,
    productHandle: product.handle,
    productImage: product.images?.nodes[0]?.url,
    productAlt: product.images?.nodes[0]?.altText,
    image: await getQRCodeImage(QRCode.id),
  };
}

async function getQRCodeImage(id) {
  const image = await qrcode.toBuffer(`${APP_URL.origin}/qrcodes/${id}/scan`);

  return `data:image/jpeg;base64, ${image.toString("base64")}`;
}

function productViewURL(shop, productHandle) {
  return `https://${shop}/products/${productHandle}`;
}

function productCheckoutURL(shop, variantId) {
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  return `https://${shop}/cart/${id}:1`;
}
