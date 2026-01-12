-- DropIndex
DROP INDEX "tickets_userId_sessionId_key";

-- CreateIndex
CREATE INDEX "tickets_userId_sessionId_idx" ON "tickets"("userId", "sessionId");
