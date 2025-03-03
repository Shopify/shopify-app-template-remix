/**
* This "schema" contains the mutations consumed by the client in payments-apps.graphql
*/
// [START build-credit-card-payments-app.schema.app-configure]
const paymentsAppConfigure = `
  mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
    paymentsAppConfigure(externalHandle: $externalHandle, ready: $ready) {
      userErrors{
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.app-configure]

// [START build-credit-card-payments-app.schema.payment-resolve]
const paymentSessionResolve = `
  mutation PaymentSessionResolve(
    $id: ID!,
    $authorizationExpiresAt: DateTime,
    $authentication: PaymentSessionThreeDSecureAuthentication,
    $networkTransactionId: String
  ) {
    paymentSessionResolve(
      id: $id,
      authorizationExpiresAt: $authorizationExpiresAt,
      authentication: $authentication,
      networkTransactionId: $networkTransactionId
    ) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStateResolved {
            code
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`
// [END build-credit-card-payments-app.schema.payment-resolve]

// [START build-credit-card-payments-app.schema.payment-reject]
const paymentSessionReject = `
  mutation PaymentSessionReject(
    $id: ID!,
    $reason: PaymentSessionRejectionReasonInput!,
    $authentication: PaymentSessionThreeDSecureAuthentication
  ) {
    paymentSessionReject(
      id: $id,
      reason: $reason,
      authentication: $authentication
    ) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStateRejected {
            code
            reason
            merchantMessage
          }
        }
        nextAction {
          action
          context {
            ... on PaymentSessionActionsRedirect {
              redirectUrl
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`
// [END build-credit-card-payments-app.schema.payment-reject]

// [START build-credit-card-payments-app.schema.payment-pending]
const paymentSessionPending = `
  mutation PaymentSessionPending($id: ID!, $pendingExpiresAt: DateTime!, $reason: PaymentSessionStatePendingReason!) {
    paymentSessionPending(id: $id, pendingExpiresAt: $pendingExpiresAt, reason: $reason) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStatePending {
            code
            reason
          }
        }
        nextAction {
          action
          context {
            ... on PaymentSessionActionsRedirect {
              redirectUrl
            }
          }
        }
        authorizationExpiresAt
        pendingExpiresAt
      }
      userErrors{
        field
        message
      }
    }
  }
`
// [END build-credit-card-payments-app.schema.payment-pending]

// [START build-credit-card-payments-app.schema.payment-redirect]
const paymentSessionRedirect = `
  mutation PaymentSessionRedirect($id: ID!, $redirectUrl: URL!) {
    paymentSessionRedirect(id: $id, redirectUrl: $redirectUrl) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStateRedirecting {
            code
          }
        }
        nextAction {
          action
          context {
            ... on PaymentSessionActionsRedirect {
              redirectUrl
            }
          }
        }
        authorizationExpiresAt
        pendingExpiresAt
      }
      userErrors{
        field
        message
      }
    }
  }
`
// [END build-credit-card-payments-app.schema.payment-redirect]

// [START build-credit-card-payments-app.schema.payment-confirm]
const paymentSessionConfirm = `
  mutation PaymentSessionConfirm($id: ID!) {
    paymentSessionConfirm(id: $id) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStateConfirming {
            code
          }
        }
        nextAction {
          action
          context {
            ... on PaymentSessionActionsRedirect {
              redirectUrl
            }
          }
        }
        authorizationExpiresAt
        pendingExpiresAt
      }
      userErrors{
        field
        message
      }
    }
  }
`
// [END build-credit-card-payments-app.schema.payment-confirm]

// [START build-credit-card-payments-app.schema.refund-resolve]
const refundSessionResolve = `
  mutation RefundSessionResolve($id: ID!) {
    refundSessionResolve(id: $id) {
      refundSession {
        id
        state {
          ... on RefundSessionStateResolved {
            code
          }
        }
      }
      userErrors{
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.refund-resolve]

// [START build-credit-card-payments-app.schema.refund-reject]
const refundSessionReject = `
  mutation RefundSessionReject($id: ID!, $reason: RefundSessionRejectionReasonInput!) {
    refundSessionReject(id: $id, reason: $reason) {
      refundSession {
        id
        state {
          ... on RefundSessionStateRejected {
            code
            reason
            merchantMessage
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.refund-reject]

// [START build-credit-card-payments-app.schema.capture-resolve]
const captureSessionResolve = `
  mutation CaptureSessionResolve($id: ID!) {
    captureSessionResolve(id: $id) {
      captureSession {
        id
        state {
          ... on CaptureSessionStateResolved {
            code
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.capture-resolve]

// [START build-credit-card-payments-app.schema.capture-reject]
const captureSessionReject = `
  mutation CaptureSessionReject($id: ID!, $reason: CaptureSessionRejectionReasonInput!) {
    captureSessionReject(id: $id, reason: $reason) {
      captureSession {
        id
        state {
          ... on CaptureSessionStateRejected {
            code
            reason
            merchantMessage
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.capture-reject]

// [START build-credit-card-payments-app.schema.void-resolve]
const voidSessionResolve = `
  mutation VoidSessionResolve($id: ID!) {
    voidSessionResolve(id: $id) {
      voidSession {
        id
        state {
          ... on VoidSessionStateResolved {
            code
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.void-resolve]

// [START build-credit-card-payments-app.schema.void-reject]
const voidSessionReject = `
  mutation VoidSessionReject($id: ID!, $reason: VoidSessionRejectionReasonInput!) {
    voidSessionReject(id: $id, reason: $reason) {
      voidSession {
        id
        state {
          ... on VoidSessionStateRejected {
            code
            reason
            merchantMessage
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-credit-card-payments-app.schema.void-reject]

export default {
  paymentsAppConfigure,
  paymentSessionResolve,
  paymentSessionReject,
  refundSessionResolve,
  refundSessionReject,
  captureSessionResolve,
  captureSessionReject,
  voidSessionResolve,
  voidSessionReject,
  paymentSessionPending,
  paymentSessionRedirect,
  paymentSessionConfirm
};
