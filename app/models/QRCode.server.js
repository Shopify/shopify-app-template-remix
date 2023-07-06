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

  return {
    ...QRCode,
    productDeleted: !product.title,
    productTitle: product.title,
    productHandle: product.handle,
    productImage: product.images?.nodes[0]?.url,
    productAlt: product.images?.nodes[0]?.altText,
    image: await getQRCodeImage(QRCode),
    destinationUrl: await getQRCodeDestinationUrl(QRCode),
  };
}

async function getQRCodeImage(QRCode) {
  const image = await qrcode.toBuffer(
    `${APP_URL.origin}/qrcodes/${QRCode.id}/scan`
  );

  return `data:image/jpeg;base64, ${image.toString("base64")}`;
}

async function getQRCodeDestinationUrl(qrCode) {
  const url = new URL(`https://${qrCode.shop}`);
  switch (qrCode.destination) {
    case "product":
      return productViewURL({
        host: url.toString(),
        productHandle: qrCode.productHandle,
        discountCode: qrCode.discountCode,
      });
    case "cart":
      return productCheckoutURL({
        discountCode: qrCode.discountCode,
        host: url.toString(),
        variantId: qrCode.productVariantId,
      });
    default:
      throw `Unrecognized destination "${qrCode.destination}"`;
  }
}

function productViewURL({ host, productHandle, discountCode }) {
  const url = new URL(host);
  const productPath = `/products/${productHandle}`;

  if (discountCode) {
    url.pathname = `/discount/${discountCode}`;
    url.searchParams.append("redirect", productPath);
  } else {
    url.pathname = productPath;
  }

  return url.toString();
}

function productCheckoutURL({ host, variantId, discountCode }) {
  const url = new URL(host);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  url.pathname = `/cart/${id}:1`;

  if (discountCode) {
    url.searchParams.append("discount", discountCode);
  }

  return url.toString();
}
