import qrcode from "qrcode";
import db from "../db.server";
import { APP_URL } from "../shopify.server";

export async function getQRCodes(shop, graphql) {
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

export async function getQRCode(id, graphql) {
  const QRCode = await db.qRCode.findFirst({ where: { id } });

  if (!QRCode) {
    return null;
  }

  return hydrateQRCode(QRCode, graphql);
}

export async function deleteQRCode(id, shop) {
  await db.qRCode.deleteMany({ where: { id, shop } });
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
