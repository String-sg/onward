/*
  Warnings:

  - A unique constraint covering the columns `[user_id,learning_unit_id]` on the table `learning_journeys` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "learning_journeys_user_id_learning_unit_id_key" ON "public"."learning_journeys"("user_id", "learning_unit_id");
