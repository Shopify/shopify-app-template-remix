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
    this.dependencyInjector(type);
  }

  /**
   * Generic session resolution function
   * @param {*} session the session to resolve upon
   * @returns the response body from the Shopify Payments Apps API
   */
  async resolveSession({ id, gid }) {
    const response = await this.#perform(schema[this.resolveMutation], { id: gid });
    const responseData = response[this.resolveMutation]
    if (responseData?.userErrors?.length === 0) await this.update?.(id, RESOLVE);

    return responseData;
  }

  /**
   * Generic session rejection function
   * @param {*} session the session to reject upon
   * @returns the response body from the Shopify Payments Apps API
   */
  async rejectSession({ id, gid }) {
    const response = await this.#perform(schema[this.rejectMutation], {
      id: gid,
      reason: {
        code: "PROCESSING_ERROR",
        merchantMessage: "The session was rejected."
      }
    })
    const responseData = response[this.rejectMutation]
    if (responseData?.userErrors?.length === 0) await this.update?.(id, REJECT);

    return responseData;
  }


  /**
   * Generic session pending function
   * @param {*} session the session to pend
   * @returns the response body from the Shopify Payments Apps API
   */
  async pendSession({ id, gid }) {
    if (this.type !== PAYMENT) throw new Error("Cannot pend a session for this client");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await this.#perform(schema[this.pendingMutation], {
      id: gid,
      pendingExpiresAt: tomorrow.toISOString(),
      reason: "PARTNER_ACTION_REQUIRED"
    });
    const responseData = response[this.pendingMutation];
    if (responseData?.userErrors?.length === 0) await this.update?.(id, PENDING);

    return responseData;
  }

  /**
   * Client perform function. Calls Shopify Payments Apps API.
   * @param {*} query the query to run
   * @param {*} variables the variables to pass
   * @returns
   */
  async #perform(query, variables) {
    const apiVersion = "unstable"

    const response = await fetch(`https://${this.shop}/payments_apps/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken
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

  async paymentsAppConfigure(externalHandle, ready) {
    const response = await this.#perform(schema.paymentsAppConfigure, { externalHandle, ready })
    return response?.paymentsAppConfigure
  }

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
