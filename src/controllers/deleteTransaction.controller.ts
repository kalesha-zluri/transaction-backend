import { Request, Response, NextFunction } from "express";
import { softDeleteTransaction } from "../services/databaseOperations.service";

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await softDeleteTransaction(parseInt(id));

    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
