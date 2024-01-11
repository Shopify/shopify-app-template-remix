import { json } from "@remix-run/node";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
import { getPaymentSession, getRejectReason, rejectReasons } from "~/payments.repository";
import { sessionStorage } from "../shopify.server";

/**
 * Confirms a session.
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();
  const paymentSession = await getPaymentSession(requestBody.id);
  const lastName = JSON.parse(paymentSession.customer).billing_address.family_name
  const partnerError = JSON.parse(paymentSession["threeDSecureAuthentication"])['partnerError']

  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

  let response;
  // Last name can be used to simulate a rejection
  if (rejectReasons.includes(lastName) || partnerError) {
    response = await client.rejectSession(paymentSession, { reasonCode: getRejectReason(lastName) });

    return json({ errors: [`Something went wrong. Error code: ${lastName}`] }, { status: response.status });
  }

  response = await client.resolveSession(paymentSession);
  const userErrors = response.userErrors;
  if (userErrors?.length > 0) return json({ errors: userErrors }, { status: response.status });

  return json({}, { status: 200 });
}
