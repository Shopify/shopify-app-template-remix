import prisma from "~/db.server";

/**
 * Creates a PaymentSession entity with the provided data.
 */
export const createPaymentSession = async (paymentSession) => {
  const {amount, paymentMethod, customer} = paymentSession;
  return await prisma.paymentSession.create({
    data: {
      ...paymentSession,
      amount: parseFloat(amount),
      paymentMethod: JSON.stringify(paymentMethod),
      customer: JSON.stringify(customer)
    }
  });
}

/**
 * Updates the given PaymentSession's status.
 */
export const updatePaymentSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.paymentSession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Returns the PaymentSession entity with the provided paymentId.
 */
export const getPaymentSession = async (id) => {
  return await prisma.paymentSession.findUniqueOrThrow({
    where: { id },
    include: { refunds: true, captures: true, void: true }
  })
}

/**
 * Fetches the 25 latest payment sessions along with their relations.
 */
export const getPaymentSessions = async () =>  {
  return await prisma.paymentSession.findMany({
    take: 25,
    include: { refunds: true, captures: true, void: true },
    orderBy: { proposedAt: 'desc' }
  })
}

/**
 * Creates a RefundSession entity with the provided data.
 */
export const createRefundSession = async (refundSession) => {
  const {amount} = refundSession;
  return await prisma.refundSession.create({
    data: {
      ...refundSession,
      amount: parseFloat(amount)
    }
  });
}

/**
 * Updates the given RefundSession's status.
 */
export const updateRefundSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.refundSession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Creates a CaptureSession entity with the provided data.
 */
export const createCaptureSession = async (captureSession) => {
  const {amount} = captureSession;
  return await prisma.captureSession.create({
    data: {
      ...captureSession,
      amount: parseFloat(amount)
    }
  });
}

/**
 * Updates the given CaptureSession's status
 */
export const updateCaptureSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.captureSession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Creates a VoidSession entity with the provided data.
 */
export const createVoidSession = async (voidSession) => {
  return await prisma.voidSession.create({ data: voidSession });
}

/**
 * Updates the given VoidSession's status
 */
export const updateVoidSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.voidSession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Returns the configuration for the provided session.
 */
export const getConfiguration = async (sessionId) => {
  const configuration = await prisma.configuration.findUnique({ where: { sessionId }});
  return configuration;
}

/**
 * Returns the configuration for the session if it exists, create it otherwise.
 */
export const getOrCreateConfiguration = async (sessionId, config) => {
  const configuration = await prisma.configuration.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId, ...config },
  })
  return configuration;
}

export const RESOLVE = "resolve"
export const REJECT = "reject"
export const PENDING = "pending"

const validateStatus = (status) => [RESOLVE, REJECT, PENDING].includes(status);