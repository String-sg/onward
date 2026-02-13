/*
  Warnings:

  - You are about to drop the column `type` on the `collections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "collections" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CollectionType";
