import { createPaymentSession, getRejectReason } from "~/payments.repository";
import { sessionStorage } from "~/shopify.server";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
import { json } from "@remix-run/node";
import decryptCreditCardPayload from "~/encryption";

/**
 * Saves and starts a payment session.
 * Returns an empty response and process the payment asyncronously
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const shopDomain = request.headers.get("shopify-shop-domain");

  const sessionPayload = createParams(requestBody, shopDomain);
  const paymentSession = await createPaymentSession(sessionPayload);

  if (!paymentSession) throw new Response("A PaymentSession couldn't be created.", { status: 500 });

  // Once the private key is set in encryption.js, this can be used for processing.
  // const creditCard = decryptCard(sessionPayload.paymentMethod.data);

  // Process the payment asyncronously
  setTimeout((async () => { processPayment(paymentSession) }), 0);

  // Return empty response, 201
  return json({}, { status: 201 });
}

const createParams = ({id, gid, group, amount, currency, test, kind, customer, payment_method, proposed_at, cancel_url, client_details}, shopDomain) => (
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
    shop: shopDomain,
    clientDetails: client_details,
  }
)

const processPayment = async (paymentSession) => {
  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

  const { billing_address: billingAddress, shipping_address: shippingAddress } = JSON.parse(paymentSession.customer);
  const firstName = billingAddress.given_name || shippingAddress.given_name;
  const lastName = (billingAddress.family_name || shippingAddress.family_name).toUpperCase();

  // Last name can be used to simulate a rejection or a 3DS session (optionally frictionless)
  if (firstName === "reject") {
    await client.rejectSession(paymentSession, { reasonCode: getRejectReason(lastName) });
  } else if (firstName === "pending") {
    await client.pendSession(paymentSession);
  } else if (firstName === "3ds") {
    const redirectUrl = three_d_secure_redirect_url(paymentSession.id, lastName === "FRICTIONLESS");
    await client.redirectSession(paymentSession, redirectUrl);
  } else {
    await client.resolveSession(paymentSession);
  }
}

const three_d_secure_redirect_url = (payment_session_id, is_frictionless) => {
  const url = process.env.SHOPIFY_APP_URL;

  return `${url}/app/three-d-secure/${payment_session_id}${is_frictionless ? "?frictionless=true" : ""}`
}

const decryptCard = ({encrypted_message, ephemeral_public_key, tag}) => {
  return decryptCreditCardPayload({
    encryptedMessage: encrypted_message,
    ephemeralPublicKey: ephemeral_public_key.replace(/\n$/, ""),
    tag
  })
}
