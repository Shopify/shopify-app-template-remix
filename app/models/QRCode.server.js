import qrcode from "qrcode";
import db from "../db.server";
import { APP_URL } from "../shopify.server";

// METAFIELDS
export function id(id) {
  return id.split("/").pop();
}

// METAFIELDS
export function gid(id) {
  return `gid://shopify/Metafield/${id}`;
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

// METAFIELDS
export async function createQRCodeDefinition(graphql) {
  return graphql(
    `
      mutation createQRCodeDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          userErrors {
            field
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

export async function createQRCode(grapqhl, data) {
  const value = { ...data };
  delete value.productId;

  // METAFIELDS
  const response = await grapqhl(
    `
      mutation createQRCode($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
        }
      }
    `,
    {
      variables: {
        metafields: {
          ownerId: data.productId,
          namespace: "$app:qrcodes",
          key: "qrcode",
          value: JSON.stringify(value),
        },
      },
    }
  );
  const json = await response.json();

  // METAFIELDS
  return id(json.data.metafieldsSet.metafields[0].id);
}

export async function getQRCode(graphql, QRCodeId) {
  // METAFIELDS
  const response = await graphql(
    `
      query getQRCode($id: ID!) {
        metafield(id: $id) {
          id
          createdAt
          key
          value
          owner {
            ... on Product {
              id
              title
              handle
              images(first: 1) {
                nodes {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        id: QRCodeId,
      },
    }
  );

  const {
    data: { metafield },
  } = await response.json();

  return hydrateQRCode(metafield);
}

export async function getQRCodes(shop, graphql) {
  const response = await graphql(
    `
      {
        metafieldDefinitions(
          namespace: "$app:qrcodes"
          key: "qrcode"
          ownerType: PRODUCT
          first: 20
        ) {
          nodes {
            metafields(first: 20) {
              nodes {
                createdAt
                key
                value
                owner {
                  ... on Product {
                    id
                    title
                    handle
                    images(first: 1) {
                      nodes {
                        url
                        altText
                      }
                    }
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

async function hydrateQRCode(metafield) {
  const QRCode = JSON.parse(metafield.value);
  const product = metafield.owner;
  const destinationUrl =
    QRCode.destination === "product"
      ? productViewURL(shop, product.handle)
      : productCheckoutURL(shop, QRCode.productVariantId);

  return {
    ...QRCode,
    destinationUrl,
    id: id(metafield.id),
    image: await getQRCodeImage(QRCode.id),
    createdAt: metafield.createdAt,
    productId: product.id,
    productTitle: product.title,
    productHandle: product.handle,
    productImage: product.images?.nodes[0]?.url,
    productAlt: product.images?.nodes[0]?.altText,
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
