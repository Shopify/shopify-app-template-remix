/**
* This "schema" contains the mutations consumed by the client in payments-apps.graphql
*/
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
