import { Request, Response } from "express";
import { softDeleteTransaction } from "../services/databaseOperations.service";

export const deleteTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (!id || isNaN(parsedId)) {
      res.status(400).json({ error: "Invalid or missing transaction ID" });
      return;
    }

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
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error: Failed to delete transaction" });
  }
};
