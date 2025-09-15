/*
  Warnings:

  - You are about to drop the column `tag` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `learning_units` table. All the data in the column will be lost.
  - Changed the type of `content_type` on the `learning_units` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('PODCAST');

-- AlterTable
ALTER TABLE "public"."collections" DROP COLUMN "tag";

-- AlterTable
ALTER TABLE "public"."learning_units" DROP COLUMN "tags",
DROP COLUMN "content_type",
ADD COLUMN     "content_type" "public"."ContentType" NOT NULL;

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collection_tags" (
    "collection_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "collection_tags_pkey" PRIMARY KEY ("collection_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."learning_unit_tags" (
    "learning_unit_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "learning_unit_tags_pkey" PRIMARY KEY ("learning_unit_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- AddForeignKey
ALTER TABLE "public"."collection_tags" ADD CONSTRAINT "collection_tags_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_tags" ADD CONSTRAINT "collection_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_tags" ADD CONSTRAINT "learning_unit_tags_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_tags" ADD CONSTRAINT "learning_unit_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
