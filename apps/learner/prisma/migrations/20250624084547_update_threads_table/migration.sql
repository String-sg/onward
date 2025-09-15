/*
  Warnings:

  - You are about to drop the column `collections_id` on the `threads` table. All the data in the column will be lost.
  - You are about to drop the column `learning_journeys_id` on the `threads` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `threads` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "threads" DROP CONSTRAINT "threads_collections_id_fkey";

-- DropForeignKey
ALTER TABLE "threads" DROP CONSTRAINT "threads_learning_journeys_id_fkey";

-- AlterTable
ALTER TABLE "threads" DROP COLUMN "collections_id",
DROP COLUMN "learning_journeys_id",
ADD COLUMN     "user_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
