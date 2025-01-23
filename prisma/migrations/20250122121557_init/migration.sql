/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "transaction_table" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountInr" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_table_dateTime_idx" ON "transaction_table"("dateTime" DESC);
