/*
  Warnings:

  - Made the column `productTitle` on table `QRCode` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QRCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "productImage" TEXT,
    "productAlt" TEXT,
    "discountId" TEXT,
    "discountCode" TEXT,
    "destination" TEXT NOT NULL,
    "scans" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_QRCode" ("destination", "discountCode", "discountId", "id", "productAlt", "productHandle", "productId", "productImage", "productTitle", "productVariantId", "scans", "shop", "title") SELECT "destination", "discountCode", "discountId", "id", "productAlt", "productHandle", "productId", "productImage", "productTitle", "productVariantId", "scans", "shop", "title" FROM "QRCode";
DROP TABLE "QRCode";
ALTER TABLE "new_QRCode" RENAME TO "QRCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
