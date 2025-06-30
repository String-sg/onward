/*
  Warnings:

  - You are about to drop the column `learning_units_id` on the `learning_journeys` table. All the data in the column will be lost.
  - You are about to drop the column `learning_units_id` on the `question_answers` table. All the data in the column will be lost.
  - Added the required column `learning_unit_id` to the `learning_journeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learning_unit_id` to the `question_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "learning_journeys" DROP CONSTRAINT "learning_journeys_learning_units_id_fkey";

-- DropForeignKey
ALTER TABLE "question_answers" DROP CONSTRAINT "question_answers_learning_units_id_fkey";

-- AlterTable
ALTER TABLE "learning_journeys" DROP COLUMN "learning_units_id",
ADD COLUMN     "learning_unit_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "question_answers" DROP COLUMN "learning_units_id",
ADD COLUMN     "learning_unit_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
