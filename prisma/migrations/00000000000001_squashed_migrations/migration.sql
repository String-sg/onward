-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."CollectionType" AS ENUM ('AI', 'BOB', 'CAREER', 'INNOV', 'NEWS', 'PROD', 'STU_DEV', 'STU_WELL', 'WELLBEING');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('PODCAST');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "email" TEXT NOT NULL,
    "google_provider_id" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collections" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."CollectionType" NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content_type" "public"."ContentType" NOT NULL,
    "content_url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "collection_id" UUID NOT NULL,

    CONSTRAINT "learning_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_unit_sentiments" (
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "has_liked" BOOLEAN NOT NULL,
    "user_id" UUID NOT NULL,
    "learning_unit_id" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "public"."learning_unit_sources" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "learning_unit_id" UUID NOT NULL,

    CONSTRAINT "learning_unit_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_journeys" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "last_checkpoint" DECIMAL(65,30) NOT NULL,
    "user_id" UUID NOT NULL,
    "learning_unit_id" UUID NOT NULL,

    CONSTRAINT "learning_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" VARCHAR(32) NOT NULL,
    "label" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collection_tags" (
    "collection_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "collection_tags_pkey" PRIMARY KEY ("collection_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."learning_unit_tags" (
    "learning_unit_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "learning_unit_tags_pkey" PRIMARY KEY ("learning_unit_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."learning_unit_sources_tags" (
    "learning_unit_source_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "learning_unit_sources_tags_pkey" PRIMARY KEY ("learning_unit_source_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."threads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "thread_id" UUID NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_answers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "question" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answer" SMALLINT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" SMALLINT NOT NULL,
    "learning_unit_id" UUID NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_provider_id_key" ON "public"."users"("google_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_unit_sentiments_user_id_learning_unit_id_key" ON "public"."learning_unit_sentiments"("user_id", "learning_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_journeys_user_id_learning_unit_id_key" ON "public"."learning_journeys"("user_id", "learning_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_code_key" ON "public"."tags"("code");

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

