/*
  Warnings:

  - A unique constraint covering the columns `[Date,Description]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Date_Description_key" ON "Transaction"("Date", "Description");
