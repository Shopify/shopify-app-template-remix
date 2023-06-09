import type { QRCode } from "@prisma/client";
import qrcode from "qrcode";

import db from "../db.server";
import { APP_URL } from "../shopify.server";

type QRCodeModel = QRCode & { image: string; destinationUrl: string };

export async function getQRCode(id: QRCode["id"]): Promise<QRCodeModel | null> {
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  if (!qrCode) return null;

  const image = await qrcode.toBuffer(
    `${APP_URL.origin}/qrcodes/${qrCode.id}/scan`
  );
  const base64Src = `data:image/jpeg;base64, ${image.toString("base64")}`;

  return {
    ...qrCode,
    image: base64Src,
    destinationUrl: await getQRCodeDestinationUrl(qrCode),
  };
}

export async function incrementScanCount(id: QRCode["id"]) {
  await db.qRCode.update({
    where: { id },
    data: { scans: { increment: 1 } },
  });
}

async function getQRCodeDestinationUrl(qrCode: QRCode): Promise<string> {
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

function productViewURL({
  host,
  productHandle,
  discountCode,
}: {
  host: string;
  productHandle: string;
  discountCode: string | null;
}) {
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

function productCheckoutURL({
  host,
  variantId,
  discountCode,
}: {
  host: string;
  variantId: string;
  discountCode: string | null;
}) {
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