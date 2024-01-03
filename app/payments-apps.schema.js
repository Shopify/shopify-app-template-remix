/**
* This "schema" contains the mutations consumed by the client in payments-apps.graphql
*/
// [START build-offsite-payments-app.schema.app-configure]
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
// [END build-offsite-payments-app.schema.app-configure]

// [START build-offsite-payments-app.schema.payment-resolve]
const paymentSessionResolve = `
  mutation PaymentSessionResolve($id: ID!) {
    paymentSessionResolve(id: $id) {
      paymentSession {
        id
        state {
          ... on PaymentSessionStateResolved {
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
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-offsite-payments-app.schema.payment-resolve]

// [START build-offsite-payments-app.schema.payment-reject]
const paymentSessionReject = `
  mutation PaymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) {
    paymentSessionReject(id: $id, reason: $reason) {
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
        authorizationExpiresAt
        pendingExpiresAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;
// [END build-offsite-payments-app.schema.payment-resolve]

// [START build-offsite-payments-app.schema.payment-pending]
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
// [END build-offsite-payments-app.schema.payment-pending]

// [START build-offsite-payments-app.schema.refund-resolve]
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
// [END build-offsite-payments-app.schema.refund-resolve]

// [START build-offsite-payments-app.schema.refund-reject]
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
// [END build-offsite-payments-app.schema.refund-reject]

// [START build-offsite-payments-app.schema.capture-resolve]
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
// [END build-offsite-payments-app.schema.capture-resolve]

// [START build-offsite-payments-app.schema.capture-reject]
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
// [END build-offsite-payments-app.schema.capture-reject]

// [START build-offsite-payments-app.schema.void-resolve]
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
// [END build-offsite-payments-app.schema.void-resolve]

// [START build-offsite-payments-app.schema.void-reject]
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
// [END build-offsite-payments-app.schema.void-reject]

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
};
