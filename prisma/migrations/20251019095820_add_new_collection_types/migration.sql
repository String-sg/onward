-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."CollectionType" ADD VALUE 'BOB';
ALTER TYPE "public"."CollectionType" ADD VALUE 'AI';
ALTER TYPE "public"."CollectionType" ADD VALUE 'PROD';
ALTER TYPE "public"."CollectionType" ADD VALUE 'CAREER';
ALTER TYPE "public"."CollectionType" ADD VALUE 'INNOV';
ALTER TYPE "public"."CollectionType" ADD VALUE 'WELLBEING';
ALTER TYPE "public"."CollectionType" ADD VALUE 'STU_WELL';
ALTER TYPE "public"."CollectionType" ADD VALUE 'STU_DEV';
