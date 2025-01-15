/*
  Warnings:

  - You are about to drop the column `Amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `Currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `Date` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,description]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Transaction_Date_Description_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "Amount",
DROP COLUMN "Currency",
DROP COLUMN "Date",
DROP COLUMN "Description",
ADD COLUMN     "amount" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_date_description_key" ON "Transaction"("date", "description");
