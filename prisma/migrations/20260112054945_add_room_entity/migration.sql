/*
  Warnings:

  - You are about to drop the column `roomNumber` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,timeSlot,roomId]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomId` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "sessions_date_timeSlot_roomNumber_key";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "roomNumber",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_number_key" ON "rooms"("number");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_date_timeSlot_roomId_key" ON "sessions"("date", "timeSlot", "roomId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
