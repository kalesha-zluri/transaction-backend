import { Request, Response, NextFunction } from "express";
import {
  updateTransaction,
  checkDuplicateTransaction,
} from "../services/databaseOperations.service";
import { validateSchema, validateDataTypes } from "../utils/validations";
import { CSVRecord } from "../types/csv.types";

export const editTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const transaction: CSVRecord = req.body;

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

    const isDuplicate = await checkDuplicateTransaction(transaction);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    const updatedTransaction = await updateTransaction(parseInt(id), transaction);
    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
    return;
  } catch (error) {
    next(error);
  }
};
