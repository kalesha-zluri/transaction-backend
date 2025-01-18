import { Request, Response } from "express";
import { saveTransactions } from "../services/databaseOperations.service";

export const uploadTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions = req.body.transactions;
    await saveTransactions(transactions);
    res.status(200).json({
      message: "File uploaded and all transactions saved successfully",
    });
  } catch (error) {
    console.error("Error saving transactions:", error);
    res.status(500).json({ error: "Internal server error: Failed to upload transactions" });
  }
};
