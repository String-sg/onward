-- AlterTable
ALTER TABLE "public"."learning_units"
ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT false;
