/*
  Warnings:

  - You are about to drop the `Discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdAt` on the `QRCode` table. All the data in the column will be lost.
  - Added the required column `productHandle` to the `QRCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `QRCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Discount";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

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
    "discountCount" TEXT,
    "destination" TEXT NOT NULL,
    "scans" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_QRCode" ("destination", "discountId", "id", "productId", "scans", "shop", "title") SELECT "destination", "discountId", "id", "productId", "scans", "shop", "title" FROM "QRCode";
DROP TABLE "QRCode";
ALTER TABLE "new_QRCode" RENAME TO "QRCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
