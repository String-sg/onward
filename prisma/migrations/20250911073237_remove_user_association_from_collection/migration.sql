/*
  Warnings:

  - You are about to drop the column `kind` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `collections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."collections" DROP CONSTRAINT "collections_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."collections" DROP COLUMN "kind",
DROP COLUMN "user_id";
