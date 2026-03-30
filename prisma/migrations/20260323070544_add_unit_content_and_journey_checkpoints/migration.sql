-- Add Learning Unit Content table
CREATE TABLE "learning_unit_contents" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v7 (),
  "learning_unit_id" UUID NOT NULL,
  "type" "ContentType" NOT NULL,
  "url" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learning_unit_contents_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "learning_unit_contents"
ADD CONSTRAINT "learning_unit_contents_learning_unit_id_fkey" FOREIGN KEY ("learning_unit_id") REFERENCES "learning_units" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill podcast content
INSERT INTO
  learning_unit_contents (
    id,
    learning_unit_id,
    type,
    url,
    created_at,
    updated_at
  )
SELECT
  uuid_generate_v7 (),
  id,
  content_type,
  content_url,
  NOW(),
  NOW()
FROM
  learning_units
WHERE
  content_type = 'PODCAST';

CREATE TABLE "learning_journey_checkpoints" (
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_checkpoint" DECIMAL(65, 30) NOT NULL,
  "learning_journey_id" UUID NOT NULL,
  "learning_unit_content_id" UUID NOT NULL,
  CONSTRAINT "learning_journey_checkpoints_pkey" PRIMARY KEY ("learning_journey_id", "learning_unit_content_id")
);

ALTER TABLE "learning_journey_checkpoints"
ADD CONSTRAINT "learning_journey_checkpoints_learning_journey_id_fkey" FOREIGN KEY ("learning_journey_id") REFERENCES "learning_journeys" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_journey_checkpoints"
ADD CONSTRAINT "learning_journey_checkpoints_learning_unit_content_id_fkey" FOREIGN KEY ("learning_unit_content_id") REFERENCES "learning_unit_contents" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill podcast endpoints
INSERT INTO
  "learning_journey_checkpoints" (
    "learning_journey_id",
    "learning_unit_content_id",
    "last_checkpoint",
    "created_at",
    "updated_at"
  )
SELECT
  lj."id",
  luc."id",
  lj."last_checkpoint",
  NOW(),
  NOW()
FROM
  "learning_journeys" lj
  JOIN "learning_unit_contents" luc ON luc."learning_unit_id" = lj."learning_unit_id"
  AND luc."type" = 'PODCAST'
WHERE
  lj."last_checkpoint" > 0
  AND NOT EXISTS (
    SELECT
      1
    FROM
      "learning_unit_contents" vid
    WHERE
      vid."learning_unit_id" = lj."learning_unit_id"
      AND vid."type" = 'VIDEO'
  )
ON CONFLICT ("learning_journey_id", "learning_unit_content_id") DO NOTHING;

-- Drop legacy columns now migrated to separate tables
ALTER TABLE "learning_units"
DROP COLUMN "content_type";

ALTER TABLE "learning_units"
DROP COLUMN "content_url";

ALTER TABLE "learning_journeys"
DROP COLUMN "last_checkpoint";
