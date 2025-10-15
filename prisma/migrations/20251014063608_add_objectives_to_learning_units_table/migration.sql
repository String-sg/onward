/*
  Warnings:

  - Added the required column `objectives` to the `learning_units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."learning_units" ADD COLUMN     "objectives" TEXT NOT NULL;
