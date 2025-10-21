/*
  Warnings:

  - You are about to drop the `collection_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."collection_tags" DROP CONSTRAINT "collection_tags_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."collection_tags" DROP CONSTRAINT "collection_tags_tag_id_fkey";

-- DropTable
DROP TABLE "public"."collection_tags";
