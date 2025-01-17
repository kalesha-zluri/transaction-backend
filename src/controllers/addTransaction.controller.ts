import { Request, Response } from "express";
import { validate_transaction_schema } from "../utils/validateSchema";
import {
  checkDuplicateTransaction,
  createTransaction,
} from "../services/databaseOperations.service";
import { CSVRecord } from "../types/csv.types";
import { toLowerCase } from "../utils/toLowerCase";

export const addTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const transaction: CSVRecord = req.body;
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

    // Check for duplicates in database
    const isDuplicate = await checkDuplicateTransaction(transformedData);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    // Save the transaction
    const newTransaction = await createTransaction(transformedData);
    res.status(201).json({
      message: "Transaction added successfully",
      data: newTransaction,
    });
    return;
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Internal server error: Failed to add transaction" });
  }
};
