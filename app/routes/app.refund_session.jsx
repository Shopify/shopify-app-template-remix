import { json } from "@remix-run/node";

import { createRefundSession } from "~/payments.repository";

/**
 * Saves and starts a refund session.
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const refundSessionHash = createParams(requestBody);
  const refundSession = await createRefundSession(refundSessionHash);

  if (!refundSession) throw new Response("A RefundSession couldn't be created.", { status: 500 });

  return json(refundSessionHash);
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