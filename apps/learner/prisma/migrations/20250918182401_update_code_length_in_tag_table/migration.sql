/*
  Warnings:

  - You are about to alter the column `code` on the `tags` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(8)`.

*/
-- AlterTable
ALTER TABLE "public"."tags" ALTER COLUMN "code" SET DATA TYPE VARCHAR(8);
