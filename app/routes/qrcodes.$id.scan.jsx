import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getQRCode, incrementScanCount } from "../models/QRCode";

export const loader = async ({ params }) => {
  invariant(params.id, "Could not find QR code destination");

  const id = Number(params.id);
  const qrCode = await getQRCode(id);

  invariant(qrCode, "Could not find QR code destination");

  await incrementScanCount(id);

  return redirect(qrCode.destinationUrl);
};
