import schema from "./payments-apps.schema";

import {
  updatePaymentSessionStatus,
  updateRefundSessionStatus,
  updateCaptureSessionStatus,
  updateVoidSessionStatus,
  RESOLVE,
  REJECT,
  PENDING
} from "./payments.repository";

/**
 * Client to interface with the Payments Apps GraphQL API.
 *
 * paymentsAppConfigure: Configure the payments app with the provided variables.
 * paymentSessionResolve: Resolves the given payment session.
 * paymentSessionReject: Rejects the given payment session.
 * refundSessionResolve: Resolves the given refund session.
 * refundSessionReject: Rejects the given refund session.
 */
export default class PaymentsAppsClient {
  constructor(shop, accessToken, type) {
    this.shop = shop;
    this.type = type || PAYMENT; // default
    this.accessToken = accessToken;
    this.resolveMutation = "";
    this.rejectMutation = "";
    this.pendingMutation = "";
    this.redirectMutation = "";
    this.confirmMutation = "";
    this.dependencyInjector(type);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.tomorrow = tomorrow;
  }

  /**
   * Generic session resolution function
   * @param {*} session the session to resolve upon
   * @returns the response body from the Shopify Payments Apps API
   */
  // [START build-credit-card-payments-app.graphql.resolve]
  async resolveSession(session) {
    const { id, gid, kind } = session;
    const payload = { id: gid };
    if (session.threeDSecureAuthentication) payload['authentication'] = { authenticationData: JSON.parse(session.threeDSecureAuthentication) }

    if (this.type === PAYMENT && kind === 'authorization') payload['authorizationExpiresAt'] = this.tomorrow.toISOString();

    const response = await this.#perform(schema[this.resolveMutation], payload);
    const responseData = response[this.resolveMutation]
    if (responseData?.userErrors?.length === 0) await this.update?.(id, RESOLVE);

    return responseData;
  }
  // [END build-credit-card-payments-app.graphql.resolve]

  /**
   * Generic session rejection function
   * @param {*} session the session to reject upon
   * @returns the response body from the Shopify Payments Apps API
   */
  // [START build-credit-card-payments-app.graphql.reject]
  async rejectSession(session, { reasonCode = "PROCESSING_ERROR" } = {}) {
    const { id, gid } = session;
    const payload = {
      id: gid,
      reason: {
        code: reasonCode,
        merchantMessage: "The session was rejected."
      }
    }
    if (session.threeDSecureAuthentication) payload['authentication'] = JSON.parse(session.threeDSecureAuthentication)

    const response = await this.#perform(schema[this.rejectMutation], payload)
    const responseData = response[this.rejectMutation]
    if (responseData?.userErrors?.length === 0) await this.update?.(id, REJECT);

    return responseData;
  }
  // [END build-credit-card-payments-app.graphql.reject]

  /**
   * Generic session pending function
   * @param {*} session the session to pend
   * @returns the response body from the Shopify Payments Apps API
   */
  // [START build-credit-card-payments-app.graphql.pending]
  async pendSession({ id, gid }) {
    if (this.type !== PAYMENT) throw new Error("Cannot pend a session for this client");

    const response = await this.#perform(schema[this.pendingMutation], {
      id: gid,
      pendingExpiresAt: this.tomorrow.toISOString(),
      reason: "PARTNER_ACTION_REQUIRED"
    });
    const responseData = response[this.pendingMutation];
    if (responseData?.userErrors?.length === 0) await this.update?.(id, PENDING);

    return responseData;
  }
  // [END build-credit-card-payments-app.graphql.pending]

  /**
   * Mutation to redirect buyer to 3DS Iframe
   * @param {*} session the session to redirect upon
   * @param {string} redirectUrl is the url we will redirect to for 3DS authentication
   * @returns the response body from the Shopify Payments Apps API
   */
  // [START build-credit-card-payments-app.graphql.redirect]
  async redirectSession({ id, gid }, redirectUrl) {
    const response = await this.#perform(schema[this.redirectMutation], {
      id: gid,
      redirectUrl: redirectUrl
    });
    const responseData = response[this.redirectMutation]
    if (responseData?.userErrors?.length === 0) await this.update?.(id, RESOLVE);

    return responseData;
  }
  // [END build-credit-card-payments-app.graphql.redirect]

  /**
   * Mutation to confirm inventory (often following 3DS)
   * @param {*} session the session to confirm
   * @returns the response body from the Shopify Payments Apps API
   */
  // [START build-credit-card-payments-app.graphql.confirm]
  async confirmSession({ id, gid }) {
    const response = await this.#perform(schema[this.confirmMutation], { id: gid });
    const responseData = response[this.confirmMutation];

    if (responseData?.userErrors?.length === 0) await this.update?.(id, RESOLVE);

    return responseData;
  }
  // [END build-credit-card-payments-app.graphql.confirm]

  /**
   * Client perform function. Calls Shopify Payments Apps API.
   * @param {*} query the query to run
   * @param {*} variables the variables to pass
   * @returns
   */
  // [START build-credit-card-payments-app.graphql.perform]
  async #perform(query, variables) {
    const apiVersion = "unstable"

    const response = await fetch(`https://${this.shop}/payments_apps/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Security-Policy': 'frame-ancestors *'
      },
      body: JSON.stringify({
        query,
        variables
      })
    })
    console.log(`[GraphQL] Making request for shop: "${this.shop}", api: "${apiVersion}"`)

    const responseBody = await response.json();
    console.log(`[GraphQL] response: ${JSON.stringify(responseBody)}`);

    return response.ok ? responseBody.data : null
  }
  // [END build-credit-card-payments-app.graphql.perform]

  // [START build-credit-card-payments-app.graphql.configure]
  async paymentsAppConfigure(externalHandle, ready) {
    const response = await this.#perform(schema.paymentsAppConfigure, { externalHandle, ready })
    return response?.paymentsAppConfigure
  }
  // [END build-credit-card-payments-app.graphql.configure]

  /**
   * Function that injects the dependencies for this client based on the session type
   * @param {'payment' | 'refund' | 'capture' | 'void'} type
   * @returns
   */
  dependencyInjector(type) {
    switch(type) {
      case PAYMENT:
        this.resolveMutation = "paymentSessionResolve"
        this.rejectMutation = "paymentSessionReject"
        this.pendingMutation = "paymentSessionPending"
        this.redirectMutation = "paymentSessionRedirect"
        this.confirmMutation = "paymentSessionConfirm"
        this.update = updatePaymentSessionStatus
        break;
      case REFUND:
        this.resolveMutation = "refundSessionResolve"
        this.rejectMutation = "refundSessionReject"
        this.update = updateRefundSessionStatus
        break;
      case CAPTURE:
        this.resolveMutation = "captureSessionResolve"
        this.rejectMutation = "captureSessionReject"
        this.update = updateCaptureSessionStatus
        break;
      case VOID:
        this.resolveMutation = "voidSessionResolve"
        this.rejectMutation = "voidSessionReject"
        this.update = updateVoidSessionStatus
        break;
    }
  }
}

export const PAYMENT = "payment"
export const REFUND = "refund"
export const CAPTURE = "capture"
export const VOID = "void"
