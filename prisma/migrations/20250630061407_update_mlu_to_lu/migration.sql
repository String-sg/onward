/*
  Warnings:

  - You are about to drop the column `multi_learning_units_id` on the `learning_journeys` table. All the data in the column will be lost.
  - You are about to drop the column `multi_learning_units_id` on the `question_answers` table. All the data in the column will be lost.
  - You are about to drop the `multi_learning_units` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `learning_units_id` to the `learning_journeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learning_units_id` to the `question_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "learning_journeys" DROP CONSTRAINT "learning_journeys_multi_learning_units_id_fkey";

-- DropForeignKey
ALTER TABLE "multi_learning_units" DROP CONSTRAINT "multi_learning_units_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "question_answers" DROP CONSTRAINT "question_answers_multi_learning_units_id_fkey";

-- AlterTable
ALTER TABLE "learning_journeys" DROP COLUMN "multi_learning_units_id",
ADD COLUMN     "learning_units_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "question_answers" DROP COLUMN "multi_learning_units_id",
ADD COLUMN     "learning_units_id" BIGINT NOT NULL;

-- DropTable
DROP TABLE "multi_learning_units";

-- CreateTable
CREATE TABLE "learning_units" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    "content_type" VARCHAR(255) NOT NULL,
    "content_url" TEXT NOT NULL,
    "collection_id" BIGINT NOT NULL,

    CONSTRAINT "learning_units_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "learning_units" ADD CONSTRAINT "learning_units_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_learning_units_id_fkey" FOREIGN KEY ("learning_units_id") REFERENCES "learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_learning_units_id_fkey" FOREIGN KEY ("learning_units_id") REFERENCES "learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
