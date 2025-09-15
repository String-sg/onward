/*
  Warnings:

  - Added the required column `summary` to the `learning_units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "learning_units" ADD COLUMN     "summary" TEXT NOT NULL;
