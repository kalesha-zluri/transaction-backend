import { Request, Response } from "express";
import { getTransactions } from "../services/databaseOperations.service";

export const getTransactionList = async (
  req: Request,
  res: Response
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }
    
    if(limitNumber>100){
      res.status(400).json({ error: "Limit should be less than 100" });
      return;
    }

    const { transactions, totalCount } = await getTransactions(
      pageNumber,
      limitNumber
    );

    res.status(200).json({
      transactions,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error: Failed to fetch transactions" });
  }
};
