-- CreateTable
CREATE TABLE "learning_unit_collections" (
"learning_unit_id" UUID NOT NULL,
"collection_id" UUID NOT NULL,
CONSTRAINT "learning_unit_collections_pkey" PRIMARY KEY ("learning_unit_id", "collection_id"),
CONSTRAINT "learning_unit_collections_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "learning_units"("id") ON DELETE CASCADE,
CONSTRAINT "learning_unit_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE
);

-- Migrate existing data
INSERT INTO "learning_unit_collections" ("learning_unit_id", "collection_id")
SELECT "id", "collection_id" FROM "learning_units" WHERE "collection_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "learning_units" DROP CONSTRAINT "learning_units_collection_id_fkey";

-- AlterTable
ALTER TABLE "learning_units" DROP COLUMN "collection_id";

-- DropForeignKey
ALTER TABLE "learning_unit_collections" DROP CONSTRAINT "learning_unit_collections_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "learning_unit_collections" DROP CONSTRAINT "learning_unit_collections_learning_unit_id_fkey";

-- AddForeignKey
ALTER TABLE "learning_unit_collections" ADD CONSTRAINT "learning_unit_collections_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "learning_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_unit_collections" ADD CONSTRAINT "learning_unit_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AlterTable
ALTER TABLE "collections" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CollectionType";

-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'QUIZ';
