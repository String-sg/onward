/*
  Warnings:

  - You are about to drop the column `name` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."tags_name_key";

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "name",
ADD COLUMN     "code" VARCHAR(32) NOT NULL,
ADD COLUMN     "label" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tags_code_key" ON "public"."tags"("code");
