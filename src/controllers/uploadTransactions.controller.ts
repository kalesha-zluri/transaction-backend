import { Request, Response, NextFunction } from "express";
import { saveTransactions } from "../services/databaseOperations.service";

export const uploadTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = req.body.transactions;
    await saveTransactions(transactions);
    res
      .status(200)
      .json({ message: "File uploaded and transactions saved successfully" });
  } catch (error) {
    next(error);
  }
};
