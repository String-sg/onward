-- AlterTable
ALTER TABLE "public"."learning_journeys" 
ADD COLUMN "is_quiz_attempted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_quiz_passed" BOOLEAN NOT NULL DEFAULT false;
