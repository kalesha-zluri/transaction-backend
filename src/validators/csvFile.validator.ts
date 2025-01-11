import { Request, Response, NextFunction } from "express";
import  parseCSV  from "../utils/csvParser";

const requiredColumns = ["Date", "Description", "Amount", "Currency"];

const validateSchema = (transactions: any[]): boolean => {
    const columns = Object.keys(transactions[0]);
    return requiredColumns.every((col) => columns.includes(col));
};

const validateDateFormat = (dateString: string): boolean => {
  // Regular expression to match the format day-month-year
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  return regex.test(dateString);
};

const validateDataTypes = (transactions: any[]): boolean => {
  for (const transaction of transactions) {
    // Validate date format
    if (!validateDateFormat(transaction.Date)) {
      return false;
    }
    //validate amount
    if (isNaN(parseFloat(transaction.Amount))) {
      return false;
    }
  }
  return true;
};

const checkForDuplicates = (transactions: any[]): boolean => {
  const seen = new Set();
  for (const transaction of transactions) {
    const key = `${transaction.Date}-${transaction.Description}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
  }
  return true;
};

export const validateCSVUpload = async (req: Request, res: Response, next: NextFunction) => {
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
    const transactions = await parseCSV(file.buffer);

    if(transactions.data.length === 0) {
      res.status(400).json({ error: transactions.error });
      return;
    }

    if (!validateSchema(transactions.data)) {
       res
        .status(400)
        .json({ error: "Invalid file schema: Missing required columns" });
        return;
    }
    if (!validateDataTypes(transactions.data)) {
       res.status(400).json({ error: "Invalid data types in file" });
       return;
    }

    if (!checkForDuplicates(transactions.data)) {
       res.status(400).json({ error: "Duplicate transaction found" });
       return;
    }

    req.body.transactions = transactions.data;
    next();
  } catch (error) {
    next(error);
  }
};