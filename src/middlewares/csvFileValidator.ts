import { Request, Response, NextFunction } from "express";
import parseCSV from "../utils/csvParser";
import { getTransactionKeys } from "../services/databaseOperations.service";

export const validateCSVUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "File is required" });
      return;
    }
    if (!file.mimetype.includes("csv")) {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }
    // Check file size (less than 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      res.status(400).json({ error: "File size exceeds 1MB" });
      return;
    }
    const transactions = await parseCSV(file.buffer);
    // Check for empty file or no valid transactions
    if (transactions.error) {
      res.status(400).json({ error: transactions.error });
      return;
    }
    // Collect keys for batch query
    const keys = transactions.data.map(
      (record) => `${record.date}-${record.description}`
    );

    // Single DB call to find existing transactions
    const existingKeys = await getTransactionKeys(keys);
    const finalRecords = [];
    const dbErrors = [];
    // Check each record against database duplicates
    for (let i = 0; i < transactions.data.length; i++) {
      const record = transactions.data[i];
      const key = `${record.date}-${record.description}`;
      if (existingKeys.has(key)) {
        dbErrors.push({
          row: "NA",
          transaction_data: record,
          reason: "Duplicate in database",
        });
      } else {
        finalRecords.push(record);
      }
    }
    // If CSV parser encountered validation errors or DB duplicates
    const allErrors = [...(transactions.errorRecord || []), ...dbErrors];
    if (allErrors.length > 0) {
      res.status(400).json({
        error: "Upload failed! Validation errors found",
        data: allErrors,
      });
      return;
    }

    // If no errors
    req.body.transactions = finalRecords;
    next();
    return;
  } catch (error) {
    console.error("Error validating CSV file or parsing CSV file:", error);
    res.status(500).json({
      error: "Internal server error: Failed to validate or parse CSV file",
    });
  }
};
