-- CreateEnum
CREATE TYPE "LearningUnitStatus" AS ENUM('DRAFT', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "learning_units"
DROP CONSTRAINT "learning_units_collection_id_fkey";

-- AlterTable
ALTER TABLE "learning_units"
ADD COLUMN "status" "LearningUnitStatus" NOT NULL DEFAULT 'PUBLISHED',
ALTER COLUMN "title"
DROP NOT NULL,
ALTER COLUMN "content_type"
DROP NOT NULL,
ALTER COLUMN "content_url"
DROP NOT NULL,
ALTER COLUMN "summary"
DROP NOT NULL,
ALTER COLUMN "objectives"
DROP NOT NULL,
ALTER COLUMN "created_by"
DROP NOT NULL,
ALTER COLUMN "collection_id"
DROP NOT NULL;

-- Default to DRAFT
ALTER TABLE "learning_units"
ALTER COLUMN "status"
SET DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "learning_units"
ADD CONSTRAINT "learning_units_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
