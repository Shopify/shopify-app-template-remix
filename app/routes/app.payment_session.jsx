import { createPaymentSession } from "~/payments.repository";

/**
 * Saves and starts a payment session.
 * Redirects back to shop if payment session was created.
 */
// [START build-offsite-payments-app.payment-session]
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const shopDomain = request.headers.get("shopify-shop-domain");

  const paymentSession = await createPaymentSession(createParams(requestBody, shopDomain));

  if (!paymentSession) throw new Response("A PaymentSession couldn't be created.", { status: 500 });

  return { "redirect_url": buildRedirectUrl(request, paymentSession.id) };
}
// [END build-offsite-payments-app.payment-session]

// [START build-offsite-payments-app.payment-session.create-params]
const createParams = ({id, gid, group, amount, currency, test, kind, customer, payment_method, proposed_at, cancel_url}, shopDomain) => (
  {
    id,
    gid,
    group,
    amount,
    currency,
    test,
    kind,
    customer,
    paymentMethod: payment_method,
    proposedAt: proposed_at,
    cancelUrl: cancel_url,
    shop: shopDomain
  }
)
// [END build-offsite-payments-app.payment-session.create-params]

// [START build-offsite-payments-app.payment-session.build-redirect-url]
const buildRedirectUrl = (request, id) => {
  return `${request.url.slice(0, request.url.lastIndexOf("/"))}/payment_simulator/${id}`
}
// [END build-offsite-payments-app.payment-session.build-redirect-url]
