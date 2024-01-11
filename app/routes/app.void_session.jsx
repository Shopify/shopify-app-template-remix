import { json } from "@remix-run/node";

import { createVoidSession } from "~/payments.repository";

/**
 * Saves and starts a void session.
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const voidSessionHash = createParams(requestBody);
  const voidSession = await createVoidSession(voidSessionHash);

  if (!voidSession) throw new Response("A VoidSession couldn't be created.", { status: 500 });

  return json(voidSessionHash);
}

const createParams = ({id, gid, payment_id, proposed_at}) => (
  {
    id,
    gid,
    paymentId: payment_id,
    proposedAt: proposed_at,
  }
)
