import { Request, Response, NextFunction } from "express";
import {
  updateTransaction,
  checkDuplicateTransaction,
} from "../services/databaseOperations.service";
import { validateTransaction } from "../middlewares/transactionValidator";

export const editTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const transaction = req.body.transaction;

    const validationError = validateTransaction(transaction);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const isDuplicate = await checkDuplicateTransaction(transaction);
    if (isDuplicate) {
      res.status(400).json({ error: "Duplicate transaction found" });
      return;
    }

    const updatedTransaction = await updateTransaction(
      parseInt(id),
      transaction
    );
    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};
