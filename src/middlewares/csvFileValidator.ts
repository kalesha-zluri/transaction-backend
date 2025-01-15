import { Request, Response, NextFunction } from "express";
import parseCSV from "../utils/csvParser";

export const validateCSVUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const ignoreDuplicates = req.body.ignoreDuplicates === "true";
    if (!file) {
      res.status(400).json({ error: "File is required" });
      return;
    }
    if (!file.mimetype.includes("csv")) {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }
    const transactions = await parseCSV(file.buffer);
    if (transactions.errors && transactions.errors.length > 0) {
      if (!ignoreDuplicates) {
        res.status(400).json({
          error: "Validation errors found",
          details: transactions.errors,
        });
        return;
      } else {
        // If ignoreDuplicates is true, we only keep the valid transactions
        req.body.transactions = transactions.data;
        req.body.errors = transactions.errors;
        next();
        return;
      }
    }
    if(transactions.error){
      res.status(400).json({error:transactions.error});
    }
    if(transactions.data.length>0){
      req.body.transactions = transactions.data;
      req.body.errors = transactions.errors;
      next();
      return ;
    }
  } catch (error) {
    next(error);
  }
};
