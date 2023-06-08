/*
  Warnings:

  - You are about to drop the column `discountCount` on the `QRCode` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QRCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "discountId" TEXT,
    "discountCode" TEXT,
    "destination" TEXT NOT NULL,
    "scans" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_QRCode" ("destination", "discountId", "id", "productHandle", "productId", "productVariantId", "scans", "shop", "title") SELECT "destination", "discountId", "id", "productHandle", "productId", "productVariantId", "scans", "shop", "title" FROM "QRCode";
DROP TABLE "QRCode";
ALTER TABLE "new_QRCode" RENAME TO "QRCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
