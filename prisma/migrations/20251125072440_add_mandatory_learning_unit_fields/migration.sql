-- Add columns to learning_journeys
ALTER TABLE "public"."learning_journeys"
ADD COLUMN "is_quiz_attempted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_quiz_passed" BOOLEAN;

-- Add columns to learning_units
ALTER TABLE "public"."learning_units"
ADD COLUMN "due_date" DATE,
ADD COLUMN "is_required" BOOLEAN NOT NULL DEFAULT false;
