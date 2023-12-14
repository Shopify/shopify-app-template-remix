import { json } from "@remix-run/node";

import { createVoidSession } from "~/payments.repository";

/**
 * Saves and starts a void session.
 */
// [START build-offsite-payments-app.void-session]
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const voidSessionHash = createParams(requestBody);
  const voidSession = await createVoidSession(voidSessionHash);

  if (!voidSession) throw new Response("A VoidSession couldn't be created.", { status: 500 });

  return json(voidSessionHash);
}
// [END build-offsite-payments-app.void-session]

// [START build-offsite-payments-app.void-session.create-params]
const createParams = ({id, gid, payment_id, proposed_at}) => (
  {
    id,
    gid,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)
// [END build-offsite-payments-app.void-session.create-params]
