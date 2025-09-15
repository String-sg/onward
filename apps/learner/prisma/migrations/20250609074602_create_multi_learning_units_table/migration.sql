-- CreateTable
CREATE TABLE "multi_learning_units" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "title" TEXT NOT NULL,
    "collection" VARCHAR(255) NOT NULL,
    "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    "content_type" VARCHAR(255) NOT NULL,
    "content_url" TEXT NOT NULL,

    CONSTRAINT "multi_learning_units_pkey" PRIMARY KEY ("id")
);
