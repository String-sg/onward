-- CreateTable
CREATE TABLE "threads" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "learning_journeys_id" BIGINT,
    "collections_id" BIGINT,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_learning_journeys_id_fkey" FOREIGN KEY ("learning_journeys_id") REFERENCES "learning_journeys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
