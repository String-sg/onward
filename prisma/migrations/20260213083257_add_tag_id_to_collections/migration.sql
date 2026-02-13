/*
  Warnings:

  - Added the required column `tag_id` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "tag_id" UUID;

-- Update tag_id by joining with tags table where tag.code matches collection.type
UPDATE "collections" c
SET "tag_id" = t."id"
    FROM "tags" t
WHERE t."code" = c."type"::text;

-- Make tag_id NOT NULL after population
ALTER TABLE "collections" ALTER COLUMN "tag_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
