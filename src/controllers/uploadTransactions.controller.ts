import { Request, Response, NextFunction } from "express";
import { saveTransactions } from "../services/databaseOperations.service";

export const uploadTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = req.body.transactions;
    const result = await saveTransactions(transactions);
    const errors = req.body.errors;
    res
      .status(200)
      .json({
        message: "File uploaded and transactions saved successfully",
        result,
        errorMessage: "These transactions are having validation errors",
        errors,
      });
  } catch (error) {
    next(error);
  }
};
