import { Request, Response, NextFunction } from "express";
import { validateSchema, validateDataTypes } from "../utils/validations";
import {
  checkDuplicateTransaction,
  createTransaction,
} from "../services/databaseOperations.service";
import { CSVRecord } from "../types/csv.types";

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction= req.body;
    // Schema validation
    if (!validateSchema(transaction)) {
      res.status(400).json({
        error: "Missing required fields: date, description, amount, currency",
      });
      return;
    }

    // Data type validation
    if (!validateDataTypes(transaction)) {
      res.status(400).json({
        error:
          "Invalid data types. Please check date format (DD-MM-YYYY), amount (numeric), and description",
      });
      return;
    }

    // Check for duplicates in database
    const isDuplicate = await checkDuplicateTransaction(transaction);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    // Save the transaction
    const newTransaction = await createTransaction(transaction);
    res.status(201).json({
      message: "Transaction added successfully",
      data: newTransaction,
    });
    return;
  } catch (error) {
    next(error);
  }
};
