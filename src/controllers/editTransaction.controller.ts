import { Request, Response } from "express";
import {
  updateTransaction,
  checkDuplicateTransaction,
  getTransactionById,
} from "../services/databaseOperations.service";
import { validate_transaction_schema } from "../utils/validateSchema";
import { CSVRecord } from "../types/csv.types";
import { toLowerCase } from "../utils/toLowerCase";

export const editTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const transaction: CSVRecord = req.body;
    const parsedId = parseInt(id);

    if (!id || isNaN(parsedId)) {
      res.status(400).json({ error: "Invalid or missing transaction ID" });
      return;
    }
    // Check if the transaction exists and is not deleted
    const existingTransaction = await getTransactionById(parseInt(id));
    if (!existingTransaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    if (existingTransaction.isDeleted) {
      res.status(400).json({ error: "Transaction already deleted" });
      return;
    }

    const transformedData = toLowerCase(transaction);
    const { valid, errors } = validate_transaction_schema(transformedData);
    // Schema validation
    if (!valid && errors) {
      const errorString = errors.join(", ");
      res.status(400).json({
        error: errorString,
      });
      return;
    }

    const isDuplicate = await checkDuplicateTransaction(transformedData);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    const updatedTransaction = await updateTransaction(
      parsedId,
      transformedData
    );
    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
    return;
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal server error: Failed to update transaction" });
  }
};
