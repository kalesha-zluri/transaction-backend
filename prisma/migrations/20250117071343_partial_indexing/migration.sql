CREATE UNIQUE INDEX "transaction.date_description_unique"
  ON "Transaction" (date, description)
  WHERE "isDeleted"=false;