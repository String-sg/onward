/*
  Warnings:

  - Made the column `objectives` on table `learning_units` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."learning_units" ALTER COLUMN "objectives" SET NOT NULL;
