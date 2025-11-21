-- AlterTable
ALTER TABLE "public"."learning_units"
ADD COLUMN     "due_date" DATE,
ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT false;
