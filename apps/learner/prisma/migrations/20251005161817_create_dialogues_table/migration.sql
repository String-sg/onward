-- CreateTable
CREATE TABLE "public"."dialogues" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "cumulative_tokens" INTEGER NOT NULL DEFAULT 0,
    "thread_id" BIGINT NOT NULL,
    "user_message_id" BIGINT NOT NULL,
    "assistant_message_id" BIGINT NOT NULL,

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dialogues_user_message_id_key" ON "public"."dialogues"("user_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "dialogues_assistant_message_id_key" ON "public"."dialogues"("assistant_message_id");

-- AddForeignKey
ALTER TABLE "public"."dialogues" ADD CONSTRAINT "dialogues_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dialogues" ADD CONSTRAINT "dialogues_user_message_id_fkey" FOREIGN KEY ("user_message_id") REFERENCES "public"."messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dialogues" ADD CONSTRAINT "dialogues_assistant_message_id_fkey" FOREIGN KEY ("assistant_message_id") REFERENCES "public"."messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
