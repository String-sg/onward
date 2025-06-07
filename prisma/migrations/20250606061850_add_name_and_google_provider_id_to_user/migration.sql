/*
  Warnings:

  - A unique constraint covering the columns `[google_provider_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `google_provider_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_provider_id" TEXT NOT NULL,
ADD COLUMN     "name" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_provider_id_key" ON "users"("google_provider_id");
