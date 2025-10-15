-- CreateTable
CREATE TABLE "public"."learning_unit_sources_tags" (
    "learning_unit_source_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "learning_unit_sources_tags_pkey" PRIMARY KEY ("learning_unit_source_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" ADD CONSTRAINT "learning_unit_sources_tags_learning_unit_source_id_fkey" FOREIGN KEY ("learning_unit_source_id") REFERENCES "public"."learning_unit_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources_tags" ADD CONSTRAINT "learning_unit_sources_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
