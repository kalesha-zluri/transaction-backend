import { Request, Response } from "express";
import { softDeleteMany } from "../services/databaseOperations.service";

export const deleteMultipleTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => isNaN(parseInt(id)))) {
      res.status(400).json({ error: "Invalid or missing transaction IDs" });
      return;
    }

    const result = await softDeleteMany(ids.map((id) => parseInt(id)));

    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({
      message: "Transactions deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res
      .status(500)
      .json({ error: "Internal server error: Failed to delete transactions" });
  }
};
