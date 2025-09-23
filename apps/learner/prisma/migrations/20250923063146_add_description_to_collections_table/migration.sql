/*
  Warnings:

  - Added the required column `description` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."collections" ADD COLUMN     "description" TEXT NOT NULL;
