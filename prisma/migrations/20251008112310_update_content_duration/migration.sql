/*
  Warnings:

  - Added the required column `content_duration` to the `learning_units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."learning_units" ADD COLUMN     "content_duration" DECIMAL(65,30) NOT NULL;
