/*
  Warnings:

  - Added the required column `role` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "learning_journeys" DROP CONSTRAINT "learning_journeys_user_id_fkey";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "role" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
