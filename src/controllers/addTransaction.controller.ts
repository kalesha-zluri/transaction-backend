import { Request, Response, NextFunction } from "express";
import {
  createTransaction,
  checkDuplicateTransaction,
} from "../services/databaseOperations.service";
import { validateTransaction } from "../middlewares/transactionValidator";

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction = req.body.transaction;

    //validate the transaction
    const validationError = validateTransaction(transaction);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    //check for duplicates in database
    const isDuplicate = await checkDuplicateTransaction(transaction);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    //save the transaction
    const newTransaction = await createTransaction(transaction);
    res
      .status(201)
      .json({
        message: "Transaction added successfully",
        data: newTransaction,
      });
  } catch (error) {
    next(error);
  }
};
