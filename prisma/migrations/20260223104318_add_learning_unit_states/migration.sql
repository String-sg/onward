-- CreateEnum
CREATE TYPE "LearningUnitStatus" AS ENUM('DRAFT', 'PUBLISHED');

-- Add column with PUBLISHED so existing rows default to PUBLISHED
ALTER TABLE "learning_units"
ADD COLUMN "status" "LearningUnitStatus" NOT NULL DEFAULT 'PUBLISHED';

-- Change default to DRAFT
ALTER TABLE "learning_units"
ALTER COLUMN "status"
SET DEFAULT 'DRAFT';