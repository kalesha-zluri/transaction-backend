/*
  Warnings:

  - Added the required column `dateTime` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_dateTime_idx" ON "Transaction"("dateTime" DESC);
