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

