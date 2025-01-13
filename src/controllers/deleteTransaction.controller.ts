import { Request, Response, NextFunction } from "express";
import { softDeleteTransaction } from "../services/databaseOperations.service";

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await softDeleteTransaction(parseInt(id));
    if (!deletedTransaction) {
      res.status(404).json({ error: "Transaction not found" });
    }
    res
      .status(200)
      .json({
        message: "Transaction deleted successfully",
        data: deletedTransaction,
      });
  } catch (error) {
    next(error);
  }
};
