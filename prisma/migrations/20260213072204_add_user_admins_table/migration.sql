-- CreateTable
CREATE TABLE "user_admins" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255),
    "email" TEXT NOT NULL,
    "google_provider_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_admins_email_key" ON "user_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_admins_google_provider_id_key" ON "user_admins"("google_provider_id");
