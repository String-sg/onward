-- CreateTable
CREATE TABLE "learning_journeys" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "last_checkpoint" DECIMAL(65,30) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "multi_learning_units_id" BIGINT NOT NULL,
    "collection_id" BIGINT NOT NULL,

    CONSTRAINT "learning_journeys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_multi_learning_units_id_fkey" FOREIGN KEY ("multi_learning_units_id") REFERENCES "multi_learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_journeys" ADD CONSTRAINT "learning_journeys_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
