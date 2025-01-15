import { Request, Response, NextFunction } from "express";
import parseCSV from "../utils/csvParser";
import { getAllTransactionKeys } from "../services/databaseOperations.service";

export const validateCSVUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const ignoreDuplicates = req.body.ignoreDuplicates === "true";
    if (!file) {
      res.status(400).json({ error: "File is required" });
      return;
    }
    if (!file.mimetype.includes("csv")) {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }
    const transactions = await parseCSV(file.buffer);
    // Check for empty file or no valid transactions
    if (transactions.error) {
      res.status(400).json({ error: transactions.error });
      return;
    }
    // Single DB call to find existing transactions
    const existingKeys = await getAllTransactionKeys();
    const finalRecords = [];
    const dbErrors = [];
    // Check each record against database duplicates
    for (let i = 0; i < transactions.data.length; i++) {
      const record = transactions.data[i];
      const key = `${record.date}-${record.description}`;
      if (existingKeys.has(key)) {
        dbErrors.push({
          row: "NA",
          data: record,
          reason: "Duplicate in database",
        });
      } else {
        finalRecords.push(record);
      }
    }
    // If CSV parser encountered validation errors or DB duplicates
    const allErrors = [...(transactions.errors || []), ...dbErrors];
    if (allErrors.length > 0) {
      if (!ignoreDuplicates) {
        res.status(400).json({
          error: "Validation errors found",
          details: allErrors,
        });
        return;
      } else {
        // If ignoreDuplicates is true, we only keep valid CSV records
        req.body.transactions = finalRecords;
        req.body.errors = allErrors;
        next();
        return;
      }
    }

    // If no errors
    req.body.transactions = transactions.data;
    req.body.errors = transactions.errors;
    next();
    return;
  } catch (error) {
    next(error);
  }
};
