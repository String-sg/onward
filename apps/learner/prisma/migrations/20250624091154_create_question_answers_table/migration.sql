-- CreateTable
CREATE TABLE "question_answers" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answer" SMALLINT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" SMALLINT NOT NULL,
    "multi_learning_units_id" BIGINT NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_multi_learning_units_id_fkey" FOREIGN KEY ("multi_learning_units_id") REFERENCES "multi_learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
