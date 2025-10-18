/*
  Warnings:

  - The primary key for the `collection_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `collections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `collections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `learning_journeys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `learning_journeys` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `learning_unit_sources` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `learning_unit_sources` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `learning_unit_sources_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `learning_unit_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `learning_units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `learning_units` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `question_answers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `question_answers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `tags` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `threads` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `collection_id` on the `collection_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tag_id` on the `collection_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `learning_journeys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_id` on the `learning_journeys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `learning_unit_sentiments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_id` on the `learning_unit_sentiments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_id` on the `learning_unit_sources` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_source_id` on the `learning_unit_sources_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tag_id` on the `learning_unit_sources_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_id` on the `learning_unit_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tag_id` on the `learning_unit_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `collection_id` on the `learning_units` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `thread_id` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `learning_unit_id` on the `question_answers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `threads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."collection_tags" DROP CONSTRAINT "collection_tags_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."collection_tags" DROP CONSTRAINT "collection_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_journeys" DROP CONSTRAINT "learning_journeys_learning_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_journeys" DROP CONSTRAINT "learning_journeys_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_sentiments" DROP CONSTRAINT "learning_unit_sentiments_learning_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_sentiments" DROP CONSTRAINT "learning_unit_sentiments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_sources" DROP CONSTRAINT "learning_unit_sources_learning_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" DROP CONSTRAINT "learning_unit_sources_tags_learning_unit_source_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" DROP CONSTRAINT "learning_unit_sources_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_tags" DROP CONSTRAINT "learning_unit_tags_learning_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_unit_tags" DROP CONSTRAINT "learning_unit_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."learning_units" DROP CONSTRAINT "learning_units_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_thread_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."question_answers" DROP CONSTRAINT "question_answers_learning_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."threads" DROP CONSTRAINT "threads_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."collection_tags" DROP CONSTRAINT "collection_tags_pkey",
DROP COLUMN "collection_id",
ADD COLUMN     "collection_id" UUID NOT NULL,
DROP COLUMN "tag_id",
ADD COLUMN     "tag_id" UUID NOT NULL,
ADD CONSTRAINT "collection_tags_pkey" PRIMARY KEY ("collection_id", "tag_id");

-- AlterTable
ALTER TABLE "public"."collections" DROP CONSTRAINT "collections_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."learning_journeys" DROP CONSTRAINT "learning_journeys_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "learning_unit_id",
ADD COLUMN     "learning_unit_id" UUID NOT NULL,
ADD CONSTRAINT "learning_journeys_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."learning_unit_sentiments" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "learning_unit_id",
ADD COLUMN     "learning_unit_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."learning_unit_sources" DROP CONSTRAINT "learning_unit_sources_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "learning_unit_id",
ADD COLUMN     "learning_unit_id" UUID NOT NULL,
ADD CONSTRAINT "learning_unit_sources_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."learning_unit_sources_tags" DROP CONSTRAINT "learning_unit_sources_tags_pkey",
DROP COLUMN "learning_unit_source_id",
ADD COLUMN     "learning_unit_source_id" UUID NOT NULL,
DROP COLUMN "tag_id",
ADD COLUMN     "tag_id" UUID NOT NULL,
ADD CONSTRAINT "learning_unit_sources_tags_pkey" PRIMARY KEY ("learning_unit_source_id", "tag_id");

-- AlterTable
ALTER TABLE "public"."learning_unit_tags" DROP CONSTRAINT "learning_unit_tags_pkey",
DROP COLUMN "learning_unit_id",
ADD COLUMN     "learning_unit_id" UUID NOT NULL,
DROP COLUMN "tag_id",
ADD COLUMN     "tag_id" UUID NOT NULL,
ADD CONSTRAINT "learning_unit_tags_pkey" PRIMARY KEY ("learning_unit_id", "tag_id");

-- AlterTable
ALTER TABLE "public"."learning_units" DROP CONSTRAINT "learning_units_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "collection_id",
ADD COLUMN     "collection_id" UUID NOT NULL,
ADD CONSTRAINT "learning_units_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "thread_id",
ADD COLUMN     "thread_id" UUID NOT NULL,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."question_answers" DROP CONSTRAINT "question_answers_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "learning_unit_id",
ADD COLUMN     "learning_unit_id" UUID NOT NULL,
ADD CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."threads" DROP CONSTRAINT "threads_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "threads_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_journeys_user_id_learning_unit_id_key" ON "public"."learning_journeys"("user_id", "learning_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_unit_sentiments_user_id_learning_unit_id_key" ON "public"."learning_unit_sentiments"("user_id", "learning_unit_id");

-- AddForeignKey
ALTER TABLE "public"."learning_units" ADD CONSTRAINT "learning_units_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sentiments" ADD CONSTRAINT "learning_unit_sentiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sentiments" ADD CONSTRAINT "learning_unit_sentiments_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources" ADD CONSTRAINT "learning_unit_sources_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_journeys" ADD CONSTRAINT "learning_journeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_journeys" ADD CONSTRAINT "learning_journeys_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_tags" ADD CONSTRAINT "collection_tags_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_tags" ADD CONSTRAINT "collection_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_tags" ADD CONSTRAINT "learning_unit_tags_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_tags" ADD CONSTRAINT "learning_unit_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" ADD CONSTRAINT "learning_unit_sources_tags_learning_unit_source_id_fkey" FOREIGN KEY ("learning_unit_source_id") REFERENCES "public"."learning_unit_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" ADD CONSTRAINT "learning_unit_sources_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."threads" ADD CONSTRAINT "threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_answers" ADD CONSTRAINT "question_answers_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
