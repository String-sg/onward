/*
  Warnings:

  - Added the required column `tag` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "tag" VARCHAR(255) NOT NULL;
