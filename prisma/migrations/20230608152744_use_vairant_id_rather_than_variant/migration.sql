/*
  Warnings:

  - You are about to drop the column `variant` on the `Product` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "variantId" TEXT NOT NULL
);
INSERT INTO "new_Product" ("handle", "id") SELECT "handle", "id" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
