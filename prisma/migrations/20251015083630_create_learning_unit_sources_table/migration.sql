-- CreateTable
CREATE TABLE "public"."learning_unit_sources" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "learning_unit_id" BIGINT NOT NULL,

    CONSTRAINT "learning_unit_sources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sources" ADD CONSTRAINT "learning_unit_sources_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
