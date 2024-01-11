import { json } from "@remix-run/node";

import { createCaptureSession } from "~/payments.repository";

/**
 * Saves and starts a capture session.
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const captureSessionHash = createParams(requestBody);
  const captureSession = await createCaptureSession(captureSessionHash);

  if (!captureSession) throw new Response("A CaptureSession couldn't be created.", { status: 500 });

  return json(captureSessionHash);
}

const createParams = ({id, gid, amount, currency, payment_id, proposed_at}) => (
  {
    id,
    gid,
    amount,
    currency,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)