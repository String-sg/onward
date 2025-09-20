/*
  Warnings:

  - Added the required column `created_by` to the `learning_units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."learning_units" ADD COLUMN     "created_by" TEXT NOT NULL;
