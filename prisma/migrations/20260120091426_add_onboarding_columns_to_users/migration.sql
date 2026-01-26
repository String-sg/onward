-- CreateEnum
CREATE TYPE "LearningFrequency" AS ENUM ('QUICK', 'REGULAR', 'ADVANCED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "learning_frequency" "LearningFrequency";

-- CreateTable
CREATE TABLE "user_interests" (
    "user_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id","collection_id")
);

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
