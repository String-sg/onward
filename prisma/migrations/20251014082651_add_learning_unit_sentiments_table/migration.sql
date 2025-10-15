-- CreateTable
CREATE TABLE "public"."learning_unit_sentiments" (
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "has_liked" BOOLEAN NOT NULL,
    "user_id" BIGINT NOT NULL,
    "learning_unit_id" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_unit_sentiments_user_id_learning_unit_id_key" ON "public"."learning_unit_sentiments"("user_id", "learning_unit_id");

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sentiments" ADD CONSTRAINT "learning_unit_sentiments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_unit_sentiments" ADD CONSTRAINT "learning_unit_sentiments_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
