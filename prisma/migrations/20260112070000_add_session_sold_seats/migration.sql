-- Add soldSeats counter to prevent oversell
ALTER TABLE "sessions" ADD COLUMN "soldSeats" INTEGER NOT NULL DEFAULT 0;

-- Backfill soldSeats for existing sessions
UPDATE "sessions" AS s
SET "soldSeats" = (
  SELECT COUNT(*)
  FROM "tickets" AS t
  WHERE t."sessionId" = s."id"
);

