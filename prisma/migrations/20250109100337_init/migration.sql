/*
  Warnings:

  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `Amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Currency` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Description` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "date",
DROP COLUMN "description",
ADD COLUMN     "Amount" TEXT NOT NULL,
ADD COLUMN     "Currency" TEXT NOT NULL,
ADD COLUMN     "Date" TEXT NOT NULL,
ADD COLUMN     "Description" TEXT NOT NULL;
