-- Additive only: existing ticket and draw data are preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS "pension_generation_batch" (
  "request_id" UUID PRIMARY KEY,
  "input_hash" TEXT NOT NULL,
  "draw_number" INTEGER NOT NULL,
  "numbers" JSONB NOT NULL,
  "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMIT;
