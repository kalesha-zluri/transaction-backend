import { Request, Response } from "express";
import { saveTransactions } from "../services/databaseOperations.service";

export const uploadTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions = req.body.transactions;
    const errors = req.body.errors;
    const result = await saveTransactions(transactions);
    res.status(200).json({
      message: "File uploaded and transactions saved successfully",
      result,
      errorMessage: "These transactions are having validation errors",
      errors,
    });
  } catch (error) {
    console.error("Error saving transactions:", error);
    res.status(500).json({ error: "Internal server error: Failed to upload transactions" });
  }
};
