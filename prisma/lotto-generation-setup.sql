-- Additive setup only. Review the target database before running.
-- Existing lottery tables and rows are not modified.
BEGIN;
CREATE TABLE IF NOT EXISTS "lotto_generation_batch" (
  "request_id" UUID PRIMARY KEY,
  "input_hash" TEXT NOT NULL,
  "draw_number" INTEGER NOT NULL,
  "numbers" JSONB NOT NULL,
  "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "lottery_request_limit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "expires" TIMESTAMPTZ(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "lottery_request_limit_expires_idx" ON "lottery_request_limit"("expires");
COMMIT;
