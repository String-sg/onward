/*
  Warnings:

  - Added the required column `type` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CollectionType" AS ENUM ('SEN', 'AI');

-- AlterTable
ALTER TABLE "public"."collections" ADD COLUMN     "type" "public"."CollectionType" NOT NULL;
