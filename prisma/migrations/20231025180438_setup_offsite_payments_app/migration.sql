-- CreateTable
CREATE TABLE "Configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT true,
    "apiVersion" TEXT NOT NULL DEFAULT 'unstable',
    CONSTRAINT "Configuration_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gid" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "test" BOOLEAN NOT NULL,
    "currency" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "cancelUrl" TEXT NOT NULL,
    "proposedAt" DATETIME NOT NULL,
    "status" TEXT
);

-- CreateTable
CREATE TABLE "RefundSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gid" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "proposedAt" DATETIME NOT NULL,
    "status" TEXT,
    CONSTRAINT "RefundSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaptureSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gid" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "proposedAt" DATETIME NOT NULL,
    "status" TEXT,
    CONSTRAINT "CaptureSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoidSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gid" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "proposedAt" DATETIME NOT NULL,
    "status" TEXT,
    CONSTRAINT "VoidSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_sessionId_key" ON "Configuration"("sessionId");

-- CreateIndex
CREATE INDEX "Configuration_sessionId_idx" ON "Configuration"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "VoidSession_paymentId_key" ON "VoidSession"("paymentId");
