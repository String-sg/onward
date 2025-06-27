/*
  Warnings:

  - You are about to drop the column `collection_id` on the `learning_journeys` table. All the data in the column will be lost.
  - You are about to drop the column `collection` on the `multi_learning_units` table. All the data in the column will be lost.
  - Added the required column `collection_id` to the `multi_learning_units` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "learning_journeys" DROP CONSTRAINT "learning_journeys_collection_id_fkey";

-- AlterTable
ALTER TABLE "learning_journeys" DROP COLUMN "collection_id";

-- AlterTable
ALTER TABLE "multi_learning_units" DROP COLUMN "collection",
ADD COLUMN     "collection_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "multi_learning_units" ADD CONSTRAINT "multi_learning_units_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
