/*
  Warnings:

  - The values [SPECIAL_EDUCATIONAL_NEEDS,LEARN_ABOUT_AI,INNOVATION,LEARN_WITH_BOB,LEARN_TO_USE_AI,STUDENT_WELLBEING,STAFF_WELLBEING] on the enum `CollectionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CollectionType_new" AS ENUM ('BOB', 'AI', 'NEWS', 'PROD', 'CAREER', 'INNOV', 'WELLBEING', 'STU_WELL', 'STU_DEV');
ALTER TABLE "public"."collections" ALTER COLUMN "type" TYPE "public"."CollectionType_new" USING ("type"::text::"public"."CollectionType_new");
ALTER TYPE "public"."CollectionType" RENAME TO "CollectionType_old";
ALTER TYPE "public"."CollectionType_new" RENAME TO "CollectionType";
DROP TYPE "public"."CollectionType_old";
COMMIT;
